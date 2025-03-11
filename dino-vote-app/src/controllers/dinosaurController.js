const pexelsService = require('../services/pexelsService');
const s3Service = require('../services/s3Service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const dinosaurController = {
   // Direct call version
   async getSomeDinosaurs() {
    try {
      const dinosaurs = await prisma.dinosaur.findMany({
        orderBy: { votes: 'desc' }
      });
      return dinosaurs;
    } catch (error) {
      console.error('Error fetching dinosaurs:', error);
      throw error;
    }
  },

  // Express middleware version
  async getDinosaurs(req, res) {
    try {
      const dinosaurs = await prisma.dinosaur.findMany({
        orderBy: { votes: 'desc' }
      });
      return res.json(dinosaurs);
    } catch (error) {
      console.error('Error fetching dinosaurs:', error);
      return res.status(500).json({ error: 'Failed to fetch dinosaurs' });
    }
  },

  async voteDinosaur(req, res) {
      const { id } = req.params;
      if (!id) {
        return res({ 
          success: false,
          error: 'Dinosaur ID is required' 
        });
      }
      const dinosaur = await prisma.dinosaur.update({
        where: { id: Number(id) },
        data: { votes: { increment: 1 } }
      });

      return res({ 
        success: true,
        data: dinosaur 
      });
  },

  async fetchNewImages(req, res) {
      const images = await pexelsService.fetchDinosaurImages();
      const savedDinosaurs = [];
      //console.log('Images fetched:', images);
      for (const image of images) {
        
        try {
          const imageUrl = await s3Service.uploadImage(image.src.original,image.src.original.split('/').at(-1));
          const dinosaur = await prisma.dinosaur.create({
            data: {
              name: image.alt,
              url: imageUrl,
              votes: 0,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          savedDinosaurs.push(dinosaur);
        } catch (imageError) {
          console.error('Error processing individual image:', imageError);
        }
      }
/*
      return res({ 
        success: true,
        data: savedDinosaurs 
      });
      */
    return res.json(savedDinosaurs); 
  },

  async getDinosaurById(req, res) {
      const { id } = req.params;
      
      if (!id) {
        return res({ 
          success: false,
          error: 'Dinosaur ID is required' 
        });
      }

      const dinosaur = await prisma.dinosaur.findUnique({
        where: { id: Number(id) }
      });

      if (!dinosaur) {
        return res({ 
          success: false,
          error: 'Dinosaur not found' 
        });
      }

      return res({ 
        success: true,
        data: dinosaur 
      });
  },

  async deleteDinosaur(req, res) {
      const { id } = req.params;
      
      if (!id) {
        return res({ 
          success: false,
          error: 'Dinosaur ID is required' 
        });
      }

      await prisma.dinosaur.delete({
        where: { id: Number(id) }
      });

      return res({ 
        success: true,
        message: 'Dinosaur deleted successfully' 
      });
  }
};

module.exports = dinosaurController;
