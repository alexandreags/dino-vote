const pexelsService = require('../services/pexelsService');
const s3Service = require('../services/s3Service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const dinosaurController = {
    // Direct call version
    async getSomeDinosaurs() {
        try {
            const dinosaurs = await prisma.dinosaur.findMany({
                orderBy: { votes: 'desc' },
                take: 20
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
                orderBy: { votes: 'desc' },
                take: 20
            });
            return res.json({
                success: true,
                data: dinosaurs
            });
        } catch (error) {
            console.error('Error fetching dinosaurs:', error);
            return res.status(500).json({ 
                success: false,
                error: 'Failed to fetch dinosaurs' 
            });
        }
    },

    async voteDinosaur(req, res) {
        try {
            const dinosaurId = parseInt(req.params.id);
            const userId = req.user.id;

            // Check if user has already voted for this dinosaur
            const existingVote = await prisma.vote.findUnique({
                where: {
                    userId_dinosaurId: {
                        userId: userId,
                        dinosaurId: dinosaurId
                    }
                },
            });
            if (existingVote) {
                return res.status(200).json({
                    success: false,
                    error: 'You have already voted for this dinosaur'
                });
            }

            const id = req.body.id || req.params.id;
            if (!id) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Dinosaur ID is required' 
                });
            }
            
            // const dinosaur = await prisma.dinosaur.update({
            //     where: { id: Number(id) },
            //     data: { votes: { increment: 1 } }
            // });

            //Create a vote for the user
            await prisma.vote.create({
                data: {
                    userId: userId,
                    dinosaurId: dinosaurId
                }
            });

            // Increment the vote count for the dinosaur
            const dinosaur = await prisma.dinosaur.update({
                where: { id: dinosaurId },
                data: {
                votes: {
                    increment: 1,
                },
                },
            });


        // If it's an API request, send JSON response
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({
                success: true,
                data: {
                    id: dinosaur.id,
                    votes: dinosaur.votes
                }
            });
        }
        // For regular form submissions, redirect back to the main page
        return res.redirect('back');
        
        } catch (error) {
            console.error('Error voting for dinosaur:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to update vote'
            });
        }
    },

    async getUserVotes (req, res) {
        try {
            const votes = await prisma.vote.findMany({
                where: { userId: req.user.id },
                include: { dinosaur: true },
            });
            
            const votedDinosaurs = votes.map(vote => vote.dinosaur);
            res.render('voted', { dinosaurs: votedDinosaurs });
        } catch (error) {
            console.error('Error fetching user votes:', error);
            res.status(500).send('Error fetching user votes');
        }
    },
//     async fetchNewImages(req, res) {
//         try {
//             const images = await pexelsService.fetchDinosaurImages();
//             const savedDinosaurs = [];
//             console.log('Images fetched:', images.length);
            
//             for (const image of images) {
//                 try {
//                     const imageUrl = await s3Service.uploadImage(
//                         image.src.original,
//                         image.src.original.split('/').at(-1)
//                     );
                    
//                     const dinosaur = await prisma.dinosaur.create({
//                         data: {
//                             name: image.alt,
//                             url: imageUrl,
//                             votes: 0,
//                             createdAt: new Date(),
//                             updatedAt: new Date()
//                         }
//                     });
//                     savedDinosaurs.push(dinosaur);
//                 } catch (imageError) {
//                     console.error('Error processing individual image:', imageError);
//                 }
//             }
            
//         // If it's an API request, send JSON response
//         if (req.xhr || req.headers.accept.indexOf('json') > -1) {
//           return res.json({
//               success: true,
//               data: savedDinosaurs
//           });
//       }
      
//       // For regular form submissions, redirect back to the main page
//       return res.redirect('/');
      
//   } catch (error) {
//       console.error('Error in fetchNewImages:', error);
//       if (req.xhr || req.headers.accept.indexOf('json') > -1) {
//           return res.status(500).json({
//               success: false,
//               error: 'Failed to fetch and save new images'
//           });
//       }
//       // For regular form submissions, redirect back with error
//       return res.redirect('/?error=Failed to fetch new images');
//   }
// },

    async fetchNewImages(req, res) {
    try {
        const images = await pexelsService.fetchDinosaurImages();
        const savedDinosaurs = [];
        console.log('Images fetched:', images.length);
        
        for (const image of images) {
            try {
                // Extract image filename from URL
                const imageFilename = image.src.original.split('/').at(-1);
                
                // Check if image already exists in database by URL or filename
                const existingDinosaur = await prisma.dinosaur.findFirst({
                    where: {
                        OR: [
                            { url: { contains: imageFilename } },
                            { originalUrl: image.src.original }
                        ]
                    }
                });

                // Skip if image already exists
                if (existingDinosaur) {
                    console.log(`Skipping duplicate image: ${imageFilename}`);
                    continue;
                }

                const imageUrl = await s3Service.uploadImage(
                    image.src.original,
                    imageFilename
                );
                
                const dinosaur = await prisma.dinosaur.create({
                    data: {
                        name: image.alt,
                        url: imageUrl,
                        originalUrl: image.src.original, // Store original URL for future checks
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
        
        // If no new images were saved, send appropriate message
        if (savedDinosaurs.length === 0) {
            return res.json({
                success: true,
                message: 'No new images to add',
                data: []
            });
        }

        return res.json({
            success: true,
            message: `Successfully added ${savedDinosaurs.length} new images`,
            data: savedDinosaurs
        });
    } catch (error) {
        console.error('Error in fetchNewImages:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch and save new images'
        });
    }
    },
    
    async getDinosaurById(req, res) {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Dinosaur ID is required' 
                });
            }

            const dinosaur = await prisma.dinosaur.findUnique({
                where: { id: Number(id) }
            });

            if (!dinosaur) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Dinosaur not found' 
                });
            }

            return res.json({ 
                success: true,
                data: dinosaur 
            });
        } catch (error) {
            console.error('Error fetching dinosaur by ID:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch dinosaur'
            });
        }
    },

    async deleteDinosaur(req, res) {
        try {
            const { id } = req.params;
            
            if (!id) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Dinosaur ID is required' 
                });
            }

            await prisma.dinosaur.delete({
                where: { id: Number(id) }
            });

            return res.json({ 
                success: true,
                message: 'Dinosaur deleted successfully' 
            });
        } catch (error) {
            console.error('Error deleting dinosaur:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to delete dinosaur'
            });
        }
    },

    async GetDinoStatistics(req, res) { 
        try {
            const totalVotes = await prisma.vote.count();
            const topDinos = await prisma.dinosaur.groupBy({
                by: ['name','votes'],
                _sum: { votes: true },
                orderBy: { 
                    votes: 'desc' 
                },
                take: 10,
            });
            const averageVotesPerUser = await prisma.vote.groupBy({
              by: ['userId'],
              _count: { userId: true },
            }).then(results => {
              const totalUsers = results.length;
              const totalVotes = results.reduce((sum, result) => sum + result._count.userId, 0);
              return totalVotes / totalUsers;
            });
        
            const votesPerHour = await prisma.$queryRaw`
              SELECT 
                DATE_FORMAT(createdAt, '%Y-%m-%d %H:00:00') as hour,
                COUNT(*) as count
              FROM Vote
              GROUP BY hour
              ORDER BY hour;
            `;
            // Convert BigInt values to strings
            const votesPerHourStringified = votesPerHour.map(vote => ({
                ...vote,
                count: vote.count.toString(),
            }));
            console.log('votesPerHour:', votesPerHourStringified);
            console.log('totalVotes:', totalVotes);
            console.log('topDinos:', topDinos);
            console.log('averageVotesPerUser:', averageVotesPerUser);


            res.render('statistics', {
              totalVotes,
              topDinos,
              averageVotesPerUser,
              votesPerHour: votesPerHourStringified,
            });
          } catch (error) {
            console.error('Error fetching statistics:', error);
            res.status(500).json({ message: 'Internal server error.' });
          }
    }
}; 

module.exports = dinosaurController;
