# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Base de données

Pour créer les tables dans votre base de données MySQL locale (via XAMPP par exemple) :

1. Assurez-vous que MySQL est lancé dans votre panneau de contrôle XAMPP.
2. Créez une base de données nommée `agenda_db` (ou celle spécifiée dans le fichier `.env`).
3. Modifiez le fichier `.env` si nécessaire pour correspondre à vos identifiants MySQL. Exemple pour XAMPP :
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/agenda_db"
   ```
4. Exécutez la commande suivante pour créer les tables :

```bash
npx prisma migrate dev --name init
```
