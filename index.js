const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();


const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "cokgizliadmin123";
const ADMIN_TOKEN = "tartarus-super-token"; // rastgele bir şey



const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// MongoDB'ye bağlan
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB bağlantısı başarılı');

  app.listen(PORT, () => {
    console.log(`Server çalışıyor: http://localhost:${PORT}`);
  });
})
.catch((err) => console.error('MongoDB bağlantı hatası:', err));

// Şema tanımı
const formSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  message: String
}, {
  timestamps: true // ⬅️ Bu satır her kayda createdAt & updatedAt alanı ekler
});

const Form = mongoose.model('Form', formSchema);

// POST endpoint
app.post('/submit-form', async (req, res) => {
  const { name, phone, email, message } = req.body;

  try {
    console.log("Gelen veri:", req.body);
    const newForm = new Form({ name, phone, email, message });
    await newForm.save();
    res.json({ success: true, message: 'Formunuz bize ulaştı. Hekimlerimiz en kısa sürede sizinle iletişime geçecek! ☺️' });
  } catch (error) {
  console.error("Hata:", error);
  res.status(500).json({ success: false, message: 'Sunucu hatası: ' + error.message });
}
});


app.post('/admin-login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_TOKEN });
  } else {
    res.json({ success: false });
  }
});

// Korumalı formları listeleme
app.get('/get-forms', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(401).json({ error: 'Yetkisiz erişim' });
  }

  Form.find().sort({ createdAt: -1 })
    .then(forms => res.json(forms))
    .catch(err => res.status(500).json({ error: 'Kayıtlar alınamadı.' }));
});

app.get('/ping', (req, res) => {
  res.status(200).send('Render çalışıyor 🟢');
});