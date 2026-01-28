# Guide de Test de l'Authentification avec Insomnia

Ce document explique comment tester les APIs d'authentification de l'application Agenda 229.

## Prérequis
- Le serveur Nuxt doit être lancé (`npm run dev`).
- La base de données doit être configurée et les migrations appliquées.
- Le seed doit être exécuté pour avoir les rôles et l'admin par défaut.

## Endpoints de Better Auth

### 1. Inscription (Sign Up)
- **URL**: `http://localhost:3000/api/auth/sign-up/email`
- **Méthode**: `POST`
- **Body (JSON)**:
```json
{
  "name": "Jean Dupont",
  "email": "jean.dupont@example.com",
  "password": "MonMotDePasse123!"
}
```
*Note: Par défaut, tout nouvel utilisateur aura le rôle 'user simple' (roleId: 3).*

### 2. Connexion (Sign In)
- **URL**: `http://localhost:3000/api/auth/sign-in/email`
- **Méthode**: `POST`
- **Body (JSON)**:
```json
{
  "email": "jean.dupont@example.com",
  "password": "MonMotDePasse123!"
}
```

### 3. Déconnexion (Sign Out)
- **URL**: `http://localhost:3000/api/auth/sign-out`
- **Méthode**: `POST`
- **Body**: Vide

### 4. Récupérer la session (Better Auth)
- **URL**: `http://localhost:3000/api/auth/get-session`
- **Méthode**: `GET`

### 5. Récupérer mon profil avec Rôle (Custom API)
- **URL**: `http://localhost:3000/api/me`
- **Méthode**: `GET`
- **Réponse attendue**:
```json
{
  "user": {
    "id": "...",
    "name": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "role": "user simple",
    "status": "active",
    ...
  },
  "session": { ... }
}
```

## Administration (Super User uniquement)

Ces requêtes nécessitent d'être connecté avec le compte `admin@example.com`.

### 6. Changer le rôle d'un utilisateur
- **URL**: `http://localhost:3000/api/admin/users/{userId}/role`
- **Méthode**: `PATCH`
- **Body (JSON)**:
```json
{
  "roleId": 2
}
```
*Note: 1=admin, 2=moderator, 3=user simple*

### 7. Activer/Désactiver un compte
- **URL**: `http://localhost:3000/api/admin/users/{userId}/status`
- **Méthode**: `PATCH`
- **Body (JSON)**:
```json
{
  "status": "inactive"
}
```
*Note: Les valeurs possibles sont "active" ou "inactive".*

## Authentification Google
L'authentification Google est configurée mais nécessite une interaction via le navigateur pour le flux OAuth2.
- **URL**: `http://localhost:3000/api/auth/login/google` (Redirige vers Google)

## Test du Super Utilisateur
Vous pouvez vous connecter avec le compte admin créé par le seed :
- **Email**: `admin@example.com`
- **Password**: `Password123!`

## Conseils pour Insomnia
- Assurez-vous que l'option **"Send cookies"** est activée dans vos requêtes Insomnia pour maintenir la session entre les appels.
- Utilisez un environnement Insomnia pour stocker la `base_url`.
