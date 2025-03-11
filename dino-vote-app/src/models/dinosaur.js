class Dinosaur {
  constructor(id, name, imageUrl, votes) {
    this.id = id;
    this.name = name;
    this.imageUrl = imageUrl;
    this.votes = votes;
  }

  static async createDinosaur(data) {
    const { name, imageUrl } = data;
    const dinosaur = await prisma.dinosaur.create({
      data: {
        name,
        imageUrl,
        votes: 0,
      },
    });
    return dinosaur;
  }

  static async updateVotes(id, votes) {
    const dinosaur = await prisma.dinosaur.update({
      where: { id },
      data: { votes },
    });
    return dinosaur;
  }

  static async findAll() {
    const dinosaurs = await prisma.dinosaur.findMany();
    return dinosaurs;
  }
}

export default Dinosaur;