const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Données en mémoire
let users = [
  { id: 1, name: 'Amadou Sow', email: 'amadou@example.com', age: 28, ville: 'Dakar' },
  { id: 2, name: 'Fatou Diop', email: 'fatou@example.com', age: 25, ville: 'Thiès' },
  { id: 3, name: 'Moussa Fall', email: 'moussa@example.com', age: 30, ville: 'Saint-Louis' }
];
let products = [
  { id: 1, name: 'Ordinateur HP', price: 350000, stock: 15 },
  { id: 2, name: 'Téléphone Samsung', price: 180000, stock: 30 },
  { id: 3, name: 'Tablette iPad', price: 450000, stock: 8 }
];
let idCounter = { users: 104, products: 104 };

// Swagger minimal
const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Mini API — Cours React',
    version: '1.0.0',
    description: 'CRUD Users & Products + /health. Swagger UI à /docs'
  },
  servers: [{
    url: 'http://localhost:3001',
    description: 'Serveur de développement'
  },
  {
    url: 'https://mini-api-ogpc.onrender.com', // ← Remplacez par votre vraie URL
    description: 'Serveur de production (Render)'
  }], // Render remplacera l’URL, c’est OK
  components: {
    schemas: {
      User: { type: 'object', properties: {
        id: { type: 'integer' }, name: { type: 'string' }, email: { type: 'string' },
        age: { type: 'integer', nullable: true }, ville: { type: 'string', nullable: true }
      }},
      Product: { type: 'object', properties: {
        id: { type: 'integer' }, name: { type: 'string' }, price: { type: 'number' }, stock: { type: 'integer' }
      }}
    }
  }
};
const swaggerSpec = swaggerJSDoc({ swaggerDefinition, apis: [] });
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// System
app.get('/', (_, res) => res.json({ message: 'Mini API OK', docs: '/docs' }));
app.get('/health', (_, res) => res.json({ status: 'OK' }));

// Users
app.get('/users', (_, res) => res.json(users));
app.get('/users/:id', (req, res) => {
  const u = users.find(x => x.id === parseInt(req.params.id));
  if (!u) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  res.json(u);
});
app.post('/users', (req, res) => {
  const { name, email, age, ville } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'Nom et email requis' });
  const user = { id: idCounter.users++, name, email, age: age ?? null, ville: ville ?? null };
  users.push(user); res.status(201).json(user);
});
app.put('/users/:id', (req, res) => {
  const i = users.findIndex(x => x.id === parseInt(req.params.id));
  if (i === -1) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  const { name, email, age, ville } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'PUT nécessite toutes les données' });
  users[i] = { id: users[i].id, name, email, age: age ?? null, ville: ville ?? null };
  res.json(users[i]);
});
app.patch('/users/:id', (req, res) => {
  const i = users.findIndex(x => x.id === parseInt(req.params.id));
  if (i === -1) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  users[i] = { ...users[i], ...req.body }; res.json(users[i]);
});
app.delete('/users/:id', (req, res) => {
  const i = users.findIndex(x => x.id === parseInt(req.params.id));
  if (i === -1) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  const removed = users.splice(i, 1)[0];
  res.json({ message: 'Utilisateur supprimé', user: removed });
});

// Products
app.get('/products', (_, res) => res.json(products));
app.get('/products/:id', (req, res) => {
  const p = products.find(x => x.id === parseInt(req.params.id));
  if (!p) return res.status(404).json({ error: 'Produit non trouvé' });
  res.json(p);
});
app.post('/products', (req, res) => {
  const { name, price, stock } = req.body || {};
  if (!name || price == null) return res.status(400).json({ error: 'Nom et prix requis' });
  const product = { id: idCounter.products++, name, price, stock: stock ?? 0 };
  products.push(product); res.status(201).json(product);
});
app.put('/products/:id', (req, res) => {
  const i = products.findIndex(x => x.id === parseInt(req.params.id));
  if (i === -1) return res.status(404).json({ error: 'Produit non trouvé' });
  const { name, price, stock } = req.body || {};
  products[i] = { id: products[i].id, name, price, stock: stock ?? 0 };
  res.json(products[i]);
});
app.patch('/products/:id', (req, res) => {
  const i = products.findIndex(x => x.id === parseInt(req.params.id));
  if (i === -1) return res.status(404).json({ error: 'Produit non trouvé' });
  products[i] = { ...products[i], ...req.body }; res.json(products[i]);
});
app.delete('/products/:id', (req, res) => {
  const i = products.findIndex(x => x.id === parseInt(req.params.id));
  if (i === -1) return res.status(404).json({ error: 'Produit non trouvé' });
  const removed = products.splice(i, 1)[0];
  res.json({ message: 'Produit supprimé', product: removed });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
