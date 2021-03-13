const Discord = require('discord.js');

const client = new Discord.Client();
const settings = {
    prefix: "?",
    token: "ODA4ODUwMTE2NjE4MzU0NzA5.YCMiXw.vRTom_1nGOek0JxSyIy2ieEh3T0",
}
const {Player} = require("discord-music-player");
const player = new Player(client, {
    leaveOnEnd: true,
    leaveOnStop: false,
    leaveOnEmpty: true,
    timeout: 300000,
    volume: 100,
    quality: "high",
});
client.player = player;

client.once("ready", () => {
    console.log("Ready! In: "+client.guilds.cache.size+" Servers");
});
client.once("reconnecting", () =>{
    console.log("Reconnecting!")
});
client.once("disconnect", () =>{
    console.log("Disconnecting!")
});

function random(message){
    const number = Math.random();
    message.channel.send(number.toString());
}

function serverinfo(message){
    const serverinfoembed = new Discord.MessageEmbed()
        .setColor("#c22817")
        .setTitle("Server Info")
        .setThumbnail(message.guild.iconURL())
        .addField("Name", message.guild.name, true)
        .addField("Members", message.guild.memberCount, true)
        .addField("Created At", message.guild.createdAt.toString(), true)
        .setTimestamp()
    
    message.channel.send(serverinfoembed);
}

function help(message){
    const commandhelpembed = new Discord.MessageEmbed()
        .setColor("#c22817")
        .setTitle("Help")
        .addField("!help", "gives helpful info about the commands and what they do")
        .addField("!random", "returns a random number")
        .addField("!server", "returns info about the server")
    message.channel.send(commandhelpembed);
}

let commands = new Map();
commands.set("random", random);
commands.set("server", serverinfo);
commands.set("help", help);



client.on("message", async (message) => {
    if(message.content[0] === settings.prefix){
        const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        if(commands.has(command)){
            commands.get(command)(message)
        }
        
        if(command === "play"){
            if(args[0]){
                let isplaying = client.player.isPlaying(message.guild.id);
                if(isplaying){
                    let song = await client.player.addToQueue(message.guild.id, args.join(" "), {}, message.author);
                    song = song.song;
                    message.channel.send(`**Added to the queue:** \`${song.name}\` **by** \`${song.author}\``);
                } else{
                    if(message.member.voice.channel){
                        let song = await client.player.play(message.member.voice.channel, args.join(" "), {}, message.author);
                        song = song.song;
                        message.channel.send(`**Now Playing:** \`${song.name}\` **by** \`${song.author}\``);
                    } else{
                        message.channel.send(":x:**Error: You must be in a voice channel to use this command!**");
                    }
                }
            } else{
                let song = await client.player.resume(message.guild.id);
                message.channel.send(`**Resumed:** \`${song.name}\``);
            }
        }

        if (command === "nowplaying" || command === "np"){
            if (client.player.isPlaying(message.guild.id)){
                let song = await client.player.nowPlaying(message.guild.id);
                let progressbar = client.player.createProgressBar(message.guild.id, 20, "🔘").replace(/ /g, "▬").replace(/=/g, "▬");
                const npembed = new Discord.MessageEmbed()
                    .setColor("#c22817")
                    .setTitle("Now Playing")
                    .setAuthor("bruh boyos")
                    .setDescription(`\`${song.name}\` by \`${song.author}\`\n\n\`${progressbar}\``)

                message.channel.send(npembed);
            } else{
                message.channel.send(":x: **Error: Nothing is playing!**");
            }
        }

        if(command === "clearqueue" || command === "clear"){
            client.player.clearQueue(message.guild.id);
            message.channel.send("**Queue Cleared!**");
        }

        if(command === "seek"){
            if(client.player.isPlaying(message.guild.id)){
                if(parseInt(args[0])){
                    let song = await client.player.seek(message.guild.id, parseInt(args[0]) * 1000);
                    message.channel.send(`Seeked to \`${args[0]}\` seconds of \`${song.song.name}\``);
                } else{
                    message.channel.send(":x: **Error: Please enter a valid time (in seconds) to seek to!**");
                }
            } else{
                message.channel.send(":x: **Error: Nothing is Playing!**");
            }
        }

        if(command === "q" || command === "queue"){
            let queue = await client.player.getQueue(message.guild.id);
            if(!queue){
                message.channel.send(":x:**Error: No songs in queue!**");
            }else{
                let qinfo = (queue.songs.map((song, i) => {
                    return `${i === 0 ? 'Now Playing' : `#${i+1}`} - \`${song.name}\` by \`${song.author}\``}).join('\n'));
                let qembed = new Discord.MessageEmbed()
                    .setColor("#c22817")
                    .setTitle("Queue")
                    .setAuthor("bruh boyos")
                    .setDescription(qinfo)
                    message.channel.send(qembed)
            }
        }

        if(command === "skip" || command === "fs"){
            if(client.player.isPlaying(message.guild.id)){
                let song = await client.player.skip(message.guild.id);
                message.channel.send(`**Skipped:** \`${song.name}\` by \`${song.author}\``);
            } else{
                message.channel.send(":x:**Error: Nothing is Playing!**");
            }
        }

        if(command === "remove"){
            if(args[0].toString()){
                let queue = await client.player.getQueue(message.guild.id);
                if(queue.songs.length >= parseInt(args[0])){
                    let songID = parseInt(args[0])-1
                    client.player.remove(message.guild.id, songID)
                    message.channel.send(`**Removed song** \`${args[0]}\` **from queue!**`);
                } else{
                    message.channel.send(":x: **Error: please enter a valid queue index!**");
                }
            } else{
                message.channel.send(":x: **Error: Please enter a valid queue index!**");
            }
        }

        if(command === "pause"){
            if(client.player.isPlaying(message.guild.id)){
                let song = await client.player.pause(message.guild.id);
                message.channel.send(`**Paused:** \`${song.name}\``);
            } else{
                message.channel.send(":x:**Error: Nothing is Playing!**");
            }
        }
        
        if(command === "resume"){
            if(client.player.isPlaying(message.guild.id)){
                let song = await client.player.resume(message.guild.id);
                message.channel.send(`**Resumed:** \`${song.name}\``);
            } else{
                message.channel.send(":x:**Error: Nothing is Playing!**");
            }
        }

        if(command === "stop" || command === "leave"){
            if(client.player.isPlaying(message.guild.id)){
                client.player.stop(message.guild.id);
            } else{
                message.channel.send(":x:**Error: Nothing is Playing!**");
            }
        }

        if(command === "shuffle"){
            client.player.shuffle(message.guild.id);
            message.channel.send("**Queue Shuffled!**");
        }

    } else if(message.content === "<@!808850116618354709>"){
        help(message);
    }
});
client.login(settings.token);