<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://calendar.vevit.fun');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/config.php';

function getVevitUser(): ?array {
    if (empty($_COOKIE['vevit_auth'])) return null;
    $data = json_decode(urldecode($_COOKIE['vevit_auth']), true);
    return is_array($data) && !empty($data['id']) ? $data : null;
}

function jsonInput() {
    return json_decode(file_get_contents('php://input'), true) ?: [];
}

function jsonResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

$vevitUser = getVevitUser();
if (!$vevitUser) {
    jsonResponse(['error' => 'Unauthorized'], 401);
}
$userId = $vevitUser['id'];

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

switch ($action) {

    case 'get_calendars':
        $stmt = $pdo->prepare('SELECT * FROM cal_calendars WHERE user_id = ? ORDER BY is_default DESC, name ASC');
        $stmt->execute([$userId]);
        jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'create_calendar':
        if ($method !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
        $input = jsonInput();
        $name = htmlspecialchars(trim($input['name'] ?? ''), ENT_QUOTES, 'UTF-8');
        $color = htmlspecialchars(trim($input['color'] ?? '#10b981'), ENT_QUOTES, 'UTF-8');
        if ($name === '') jsonResponse(['error' => 'Name is required'], 400);
        $stmt = $pdo->prepare('INSERT INTO cal_calendars (user_id, name, color) VALUES (?, ?, ?)');
        $stmt->execute([$userId, $name, $color]);
        jsonResponse(['id' => (int)$pdo->lastInsertId(), 'name' => $name, 'color' => $color, 'is_visible' => 1, 'is_default' => 0], 201);
        break;

    case 'update_calendar':
        if ($method !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
        $input = jsonInput();
        $id = (int)($input['id'] ?? 0);
        if (!$id) jsonResponse(['error' => 'ID is required'], 400);
        $fields = [];
        $params = [];
        foreach (['name', 'color', 'is_visible'] as $f) {
            if (isset($input[$f])) {
                $fields[] = "$f = ?";
                $params[] = $f === 'name' ? htmlspecialchars(trim($input[$f]), ENT_QUOTES, 'UTF-8') : $input[$f];
            }
        }
        if (empty($fields)) jsonResponse(['error' => 'No fields to update'], 400);
        $params[] = $id;
        $params[] = $userId;
        $stmt = $pdo->prepare('UPDATE cal_calendars SET ' . implode(', ', $fields) . ' WHERE id = ? AND user_id = ?');
        $stmt->execute($params);
        jsonResponse(['success' => true]);
        break;

    case 'delete_calendar':
        if ($method !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
        $input = jsonInput();
        $id = (int)($input['id'] ?? 0);
        if (!$id) jsonResponse(['error' => 'ID is required'], 400);
        $check = $pdo->prepare('SELECT is_default FROM cal_calendars WHERE id = ? AND user_id = ?');
        $check->execute([$id, $userId]);
        $cal = $check->fetch(PDO::FETCH_ASSOC);
        if (!$cal) jsonResponse(['error' => 'Not found'], 404);
        if ($cal['is_default']) jsonResponse(['error' => 'Cannot delete default calendar'], 403);
        $pdo->prepare('DELETE FROM cal_events WHERE calendar_id = ? AND user_id = ?')->execute([$id, $userId]);
        $pdo->prepare('DELETE FROM cal_calendars WHERE id = ? AND user_id = ?')->execute([$id, $userId]);
        jsonResponse(['success' => true]);
        break;

    case 'get_events':
        $start = $_GET['start'] ?? '';
        $end = $_GET['end'] ?? '';
        if (!$start || !$end) jsonResponse(['error' => 'start and end required'], 400);
        $stmt = $pdo->prepare(
            'SELECT e.*, c.color AS calendar_color, c.name AS calendar_name
             FROM cal_events e
             JOIN cal_calendars c ON e.calendar_id = c.id
             WHERE e.user_id = ?
               AND e.start_date <= ?
               AND e.end_date >= ?
               AND c.is_visible = 1
             ORDER BY e.start_date, e.start_time'
        );
        $stmt->execute([$userId, $end, $start]);
        jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'create_event':
        if ($method !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
        $input = jsonInput();
        $title = htmlspecialchars(trim($input['title'] ?? ''), ENT_QUOTES, 'UTF-8');
        $calendarId = (int)($input['calendar_id'] ?? 0);
        $startDate = $input['start_date'] ?? '';
        $endDate = $input['end_date'] ?? '';
        if ($title === '' || !$calendarId || !$startDate || !$endDate) {
            jsonResponse(['error' => 'Required fields missing'], 400);
        }
        $stmt = $pdo->prepare(
            'INSERT INTO cal_events (user_id, calendar_id, title, start_date, start_time, end_date, end_time, is_all_day, location, description, recurrence, reminder)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $userId,
            $calendarId,
            $title,
            $startDate,
            $input['start_time'] ?? null,
            $endDate,
            $input['end_time'] ?? null,
            (int)($input['is_all_day'] ?? 0),
            isset($input['location']) ? htmlspecialchars(trim($input['location']), ENT_QUOTES, 'UTF-8') : null,
            isset($input['description']) ? htmlspecialchars(trim($input['description']), ENT_QUOTES, 'UTF-8') : null,
            $input['recurrence'] ?? 'none',
            $input['reminder'] ?? null,
        ]);
        $eid = (int)$pdo->lastInsertId();
        $cstmt = $pdo->prepare('SELECT color, name FROM cal_calendars WHERE id = ?');
        $cstmt->execute([$calendarId]);
        $cal = $cstmt->fetch(PDO::FETCH_ASSOC);
        jsonResponse([
            'id' => $eid,
            'title' => $title,
            'calendar_id' => $calendarId,
            'start_date' => $startDate,
            'start_time' => $input['start_time'] ?? null,
            'end_date' => $endDate,
            'end_time' => $input['end_time'] ?? null,
            'is_all_day' => (int)($input['is_all_day'] ?? 0),
            'location' => $input['location'] ?? null,
            'description' => $input['description'] ?? null,
            'recurrence' => $input['recurrence'] ?? 'none',
            'reminder' => $input['reminder'] ?? null,
            'calendar_color' => $cal['color'] ?? '#10b981',
            'calendar_name' => $cal['name'] ?? '',
        ], 201);
        break;

    case 'update_event':
        if ($method !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
        $input = jsonInput();
        $id = (int)($input['id'] ?? 0);
        if (!$id) jsonResponse(['error' => 'ID is required'], 400);
        $check = $pdo->prepare('SELECT id FROM cal_events WHERE id = ? AND user_id = ?');
        $check->execute([$id, $userId]);
        if (!$check->fetch()) jsonResponse(['error' => 'Not found'], 404);
        $fields = [];
        $params = [];
        $allowed = ['title', 'calendar_id', 'start_date', 'start_time', 'end_date', 'end_time', 'is_all_day', 'location', 'description', 'recurrence', 'reminder'];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $input)) {
                $fields[] = "$f = ?";
                $val = $input[$f];
                if (in_array($f, ['title', 'location', 'description'])) {
                    $val = htmlspecialchars(trim($val), ENT_QUOTES, 'UTF-8');
                }
                if ($val === '') $val = null;
                $params[] = $val;
            }
        }
        if (empty($fields)) jsonResponse(['error' => 'No fields to update'], 400);
        $params[] = $id;
        $params[] = $userId;
        $pdo->prepare('UPDATE cal_events SET ' . implode(', ', $fields) . ' WHERE id = ? AND user_id = ?')->execute($params);
        $stmt = $pdo->prepare(
            'SELECT e.*, c.color AS calendar_color, c.name AS calendar_name
             FROM cal_events e JOIN cal_calendars c ON e.calendar_id = c.id
             WHERE e.id = ? AND e.user_id = ?'
        );
        $stmt->execute([$id, $userId]);
        jsonResponse($stmt->fetch(PDO::FETCH_ASSOC));
        break;

    case 'delete_event':
        if ($method !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
        $input = jsonInput();
        $id = (int)($input['id'] ?? 0);
        if (!$id) jsonResponse(['error' => 'ID is required'], 400);
        $pdo->prepare('DELETE FROM cal_events WHERE id = ? AND user_id = ?')->execute([$id, $userId]);
        jsonResponse(['success' => true]);
        break;

    case 'get_folders':
        $stmt = $pdo->prepare(
            'SELECT f.*,
             (SELECT COUNT(*) FROM cal_reminders r WHERE r.folder_id = f.id AND r.is_done = 0) AS pending_count
             FROM cal_reminder_folders f WHERE f.user_id = ? ORDER BY f.name ASC'
        );
        $stmt->execute([$userId]);
        jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'create_folder':
        if ($method !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
        $input = jsonInput();
        $name = htmlspecialchars(trim($input['name'] ?? ''), ENT_QUOTES, 'UTF-8');
        $icon = htmlspecialchars(trim($input['icon'] ?? 'bell'), ENT_QUOTES, 'UTF-8');
        $color = htmlspecialchars(trim($input['color'] ?? '#9ca3af'), ENT_QUOTES, 'UTF-8');
        if ($name === '') jsonResponse(['error' => 'Name is required'], 400);
        $stmt = $pdo->prepare('INSERT INTO cal_reminder_folders (user_id, name, icon, color) VALUES (?, ?, ?, ?)');
        $stmt->execute([$userId, $name, $icon, $color]);
        jsonResponse(['id' => (int)$pdo->lastInsertId(), 'name' => $name, 'icon' => $icon, 'color' => $color, 'pending_count' => 0], 201);
        break;

    case 'delete_folder':
        if ($method !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
        $input = jsonInput();
        $id = (int)($input['id'] ?? 0);
        if (!$id) jsonResponse(['error' => 'ID is required'], 400);
        $pdo->prepare('DELETE FROM cal_reminders WHERE folder_id = ? AND user_id = ?')->execute([$id, $userId]);
        $pdo->prepare('DELETE FROM cal_reminder_folders WHERE id = ? AND user_id = ?')->execute([$id, $userId]);
        jsonResponse(['success' => true]);
        break;

    case 'get_reminders':
        $folderId = (int)($_GET['folder_id'] ?? 0);
        if ($folderId) {
            $stmt = $pdo->prepare('SELECT * FROM cal_reminders WHERE folder_id = ? AND user_id = ? ORDER BY is_done ASC, due_date ASC, created_at DESC');
            $stmt->execute([$folderId, $userId]);
        } else {
            $stmt = $pdo->prepare('SELECT * FROM cal_reminders WHERE user_id = ? ORDER BY is_done ASC, due_date ASC, created_at DESC');
            $stmt->execute([$userId]);
        }
        jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'create_reminder':
        if ($method !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
        $input = jsonInput();
        $title = htmlspecialchars(trim($input['title'] ?? ''), ENT_QUOTES, 'UTF-8');
        $folderId = (int)($input['folder_id'] ?? 0);
        if ($title === '' || !$folderId) jsonResponse(['error' => 'Title and folder required'], 400);
        $priority = in_array($input['priority'] ?? '', ['low', 'medium', 'high']) ? $input['priority'] : 'medium';
        $stmt = $pdo->prepare('INSERT INTO cal_reminders (user_id, folder_id, title, due_date, priority) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$userId, $folderId, $title, $input['due_date'] ?? null, $priority]);
        jsonResponse([
            'id' => (int)$pdo->lastInsertId(),
            'folder_id' => $folderId,
            'title' => $title,
            'due_date' => $input['due_date'] ?? null,
            'priority' => $priority,
            'is_done' => 0,
        ], 201);
        break;

    case 'toggle_reminder':
        if ($method !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
        $input = jsonInput();
        $id = (int)($input['id'] ?? 0);
        if (!$id) jsonResponse(['error' => 'ID is required'], 400);
        $stmt = $pdo->prepare('UPDATE cal_reminders SET is_done = NOT is_done WHERE id = ? AND user_id = ?');
        $stmt->execute([$id, $userId]);
        jsonResponse(['success' => true]);
        break;

    case 'delete_reminder':
        if ($method !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
        $input = jsonInput();
        $id = (int)($input['id'] ?? 0);
        if (!$id) jsonResponse(['error' => 'ID is required'], 400);
        $pdo->prepare('DELETE FROM cal_reminders WHERE id = ? AND user_id = ?')->execute([$id, $userId]);
        jsonResponse(['success' => true]);
        break;

    case 'search':
        $q = trim($_GET['q'] ?? '');
        if ($q === '') jsonResponse([]);
        $like = '%' . $q . '%';
        $results = [];
        $stmt = $pdo->prepare(
            'SELECT e.id, e.title, e.start_date, e.start_time, e.is_all_day, c.color, c.name AS calendar_name, "event" AS type
             FROM cal_events e JOIN cal_calendars c ON e.calendar_id = c.id
             WHERE e.user_id = ? AND e.title LIKE ? ORDER BY e.start_date DESC LIMIT 6'
        );
        $stmt->execute([$userId, $like]);
        $results = array_merge($results, $stmt->fetchAll(PDO::FETCH_ASSOC));
        $remaining = 6 - count($results);
        if ($remaining > 0) {
            $stmt = $pdo->prepare(
                'SELECT id, title, due_date, priority, "reminder" AS type, "" AS color, "" AS calendar_name
                 FROM cal_reminders WHERE user_id = ? AND title LIKE ? ORDER BY due_date ASC LIMIT ?'
            );
            $stmt->execute([$userId, $like, $remaining]);
            $results = array_merge($results, $stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        jsonResponse($results);
        break;

    case 'init_defaults':
        if ($method !== 'POST') jsonResponse(['error' => 'Method not allowed'], 405);
        $defaults = [
            ['name' => 'Osobní', 'color' => '#10b981', 'icon' => null],
            ['name' => 'Práce', 'color' => '#3b82f6', 'icon' => null],
            ['name' => 'Svátky', 'color' => '#f59e0b', 'icon' => null],
        ];
        $folderDefaults = [
            ['name' => 'Osobní', 'icon' => 'user', 'color' => '#9ca3af'],
            ['name' => 'Práce', 'icon' => 'briefcase', 'color' => '#3b82f6'],
            ['name' => 'Nákupy', 'icon' => 'shopping-cart', 'color' => '#f59e0b'],
        ];
        $check = $pdo->prepare('SELECT COUNT(*) FROM cal_calendars WHERE user_id = ?');
        $check->execute([$userId]);
        if ((int)$check->fetchColumn() === 0) {
            $stmt = $pdo->prepare('INSERT INTO cal_calendars (user_id, name, color, is_default) VALUES (?, ?, ?, 1)');
            foreach ($defaults as $d) {
                $stmt->execute([$userId, $d['name'], $d['color']]);
            }
        }
        $check = $pdo->prepare('SELECT COUNT(*) FROM cal_reminder_folders WHERE user_id = ?');
        $check->execute([$userId]);
        if ((int)$check->fetchColumn() === 0) {
            $stmt = $pdo->prepare('INSERT INTO cal_reminder_folders (user_id, name, icon, color) VALUES (?, ?, ?, ?)');
            foreach ($folderDefaults as $d) {
                $stmt->execute([$userId, $d['name'], $d['icon'], $d['color']]);
            }
        }
        jsonResponse(['success' => true]);
        break;

    default:
        jsonResponse(['error' => 'Unknown action'], 400);
}