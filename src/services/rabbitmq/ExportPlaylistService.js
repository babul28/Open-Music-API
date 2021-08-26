const amqp = require('amqplib');

const ExportPlaylistService = {
  dispatch: async (message) => {
    const queue = 'exports:open-music-playlist';
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: true,
    });

    await channel.sendToQueue(queue, Buffer.from(message));

    setTimeout(() => {
      connection.close();
    }, 1000);
  },
};

module.exports = ExportPlaylistService;
