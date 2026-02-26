# VeVit Kalendář

Moderní kalendářová aplikace pro projekt VeVit s čistým, profesionálním designem inspirovaným vevit.fun.

## Funkce

- 📅 Měsíční pohled na kalendář s mřížkovým zobrazením
- ✨ Vytváření, úpravy a mazání událostí
- 🎨 Barevné kategorie událostí (primary, accent, secondary)
- 🌙 Tmavý režim s výraznými neonovými akcenty
- 📱 Responzivní design s postranním menu
- 🔄 Celodenní události i časově vymezené události

## Technologie

### Frontend
- React s TypeScript
- Wouter pro směrování
- TanStack Query pro správu dat
- Shadcn UI komponenty
- Tailwind CSS pro stylování
- date-fns pro práci s datumy

### Backend
- Express.js server
- PostgreSQL databáze (Drizzle ORM)
- Zod validace
- RESTful API

## Struktura

```
shared/
  schema.ts       # Drizzle tabulky a typy
  routes.ts       # API kontrakt s Zod validací

server/
  db.ts          # Databázové připojení
  storage.ts     # Datová vrstva
  routes.ts      # API endpointy

client/
  src/
    pages/
      calendar.tsx  # Hlavní kalendářová stránka
      home.tsx      # Úvodní stránka
      settings.tsx  # Nastavení
    components/
      app-sidebar.tsx    # Postranní menu
      event-dialog.tsx   # Dialog pro události
    hooks/
      use-events.ts      # React hooks pro práci s událostmi
```

## API Endpointy

- `GET /api/events` - Načtení všech událostí
- `POST /api/events` - Vytvoření nové události
- `PATCH /api/events/:id` - Úprava události
- `DELETE /api/events/:id` - Smazání události

## Design

Tmavý moderní styl s fialovými a modrými akcenty:
- Tmavé pozadí (hsl(240 10% 4%))
- Neonová purpurová (hsl(270 100% 60%))
- Živá modrá (hsl(230 100% 60%))
- Outfit font pro nadpisy, DM Sans pro tělo textu

## Spuštění

Projekt běží automaticky pomocí workflow "Start application", které spouští:
```bash
npm run dev
```

Databáze je automaticky synchronizována při startu.
