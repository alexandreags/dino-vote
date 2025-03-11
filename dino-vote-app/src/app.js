const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const fs = require('fs');
dotenvpath = path.join('../.env');

if (fs.existsSync(dotenvpath)) {
    const config = dotenv.config({ path: path.join(__dirname, '../../.env') });
    dotenvExpand.expand(config);
}else{
  console.log('Environment file not Loaded or Variables in System');

}

const dinosaurRoutes = require('./routes/dinosaurRoutes');
const DinosaurController = require('./controllers/dinosaurController');

console.log(process.env.DATABASE_URL);

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.urlencoded({ extended: true }));

// For direct data fetching
async function init() {
  try {
    const dinosaurs = await DinosaurController.getAllDinosaurs();
    return dinosaurs;
  } catch (error) {
    console.error('Error fetching dinosaurs:', error);
    return [];
  }
}

// Initialize your data
//const dinos = init();


app.use('/dinosaurs', dinosaurRoutes);
// Define routes
app.get('/dinosaurs', DinosaurController.getDinosaurs);
app.post('/dinosaurs/vote/:id', DinosaurController.voteDinosaur);
app.post('/dinosaurs/fetch-images', DinosaurController.fetchNewImages);
app.get('/dinosaurs/:id', DinosaurController.getDinosaurById);
app.delete('/dinosaurs/:id', DinosaurController.deleteDinosaur);
app.get('/', async (req, res) => {
  const dinosaurs = await DinosaurController.getSomeDinosaurs(); 
  res.render('index', { dinosaurs: dinosaurs });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;