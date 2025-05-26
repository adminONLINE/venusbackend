const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();





const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*',              // test için tüm domainlere izin ver
  methods: ['GET', 'POST'], // sadece gerekli methodlara izin ver
  allowedHeaders: ['Content-Type']
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


