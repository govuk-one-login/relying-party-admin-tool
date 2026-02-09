import express from 'express';

import { indexRouter } from './routes/index.js';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { configureNunjucks } from './config/nunjucks.js';

const directory_name = dirname(fileURLToPath(import.meta.url));

const APP_VIEWS = [
  path.join(directory_name, "components"),
];

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", configureNunjucks(app, APP_VIEWS));

app.use('/', indexRouter);

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});

export { app };