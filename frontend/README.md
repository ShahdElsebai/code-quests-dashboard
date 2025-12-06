# Frontend

This folder contains the **frontend application** of the project, built with **Angular**.

## Table of Contents

- [Project Setup](#project-setup)
- [Scripts](#scripts)
- [Folder Structure](#folder-structure)
- [Technologies](#technologies)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Project Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
ng serve
```

3. Open the app in your browser:

```
http://localhost:4200
```

---

## Scripts

| Command        | Description                                   |
|----------------|-----------------------------------------------|
| `ng serve`     | Start the development server                  |
| `ng build`     | Build the app for production                  |
| `ng test`      | Run unit tests (Vitest or Karma)             |
| `ng lint`      | Run linter                                   |
| `ng e2e`      | Run end-to-end tests                          |

---

## Folder Structure

```
frontend/
├─ src/
│  ├─ app/                  # Angular application code
│  ├─ assets/               # Images, icons, static files
│  ├─ environments/         # Environment configs
│  └─ index.html
├─ angular.json
├─ package.json
└─ tsconfig.json
```

---

## Technologies

- Angular 21
- TypeScript
- RxJS / Signals
- ECharts (for charts and heatmaps)
- ngx-toastr (for notifications)
- SCSS for styling

---

## Environment Variables

The project uses environment variables located in:

```
src/environments/environment.ts
src/environments/environment.prod.ts
```

Update `apiBase` to point to your backend API.

```ts
export const environment = {
  production: false,
  apiBase: 'http://localhost:3000/api'
};
```

---

## License

This project is licensed under the MIT License.