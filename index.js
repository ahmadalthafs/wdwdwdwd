const Discord = require('discord.js');
const generator = require('generate-serial-number');
const fs = require('fs');
const readline = require('readline');
const bot = new Discord.Client();


bot.on("ready", () => {
    console.log("Selly Discord bot is ready!");
});

bot.on("message", (message) => {
    
    if(message.author.bot) return;

    if(message.channel.type == "dm") return;

    if(!message.content.startsWith(process.env.prefix)) return;

    const args = message.content.slice(process.env.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(command == "redeem") {
        var keysMap = new Map();
        var key = args[0];
        var redeemRole = message.guild.roles.find("name", process.env.role);

        var rl = readline.createInterface(fs.createReadStream('./keys.txt'));

        rl.on("line", (line) => {
            var cleaned = line.replace(",", "");
            keysMap.set(cleaned, cleaned);
        });

        rl.on("close", () => {
            if(message.member.roles.has(redeemRole.id)) {
                message.reply("You've already redeemed a key!");
                
                if(message.deletable) {
                    message.delete();
                }
    
                return;
            }
    
            if(!key || key.length <= 0) {
                message.reply("Specify a valid key!");

                if(message.deletable) {
                    message.delete();
                }

                return;
            }
    
            if(keysMap.has(key)) {
                message.member.addRole(redeemRole);
                message.reply("Key redeemed!");
                keysMap.delete(key);
                var processed = 0;
                var keysString = "";
                keysMap.forEach(item => {
                    processed++;
                    if(processed == keysMap.size) {
                        keysString += `${item}`;
                        fs.writeFileSync('./keys.txt', keysString);
                    } else {
                        keysString += `${item},\n`;
                    }
                })
            } else {
                message.reply("Invalid key!");
                if(message.deletable) {
                    message.delete();
                }
            }
        })
    }

    if(command == "generate") {
        if(!message.member.id == message.guild.ownerID) return message.reply("You are not the owner of the server.");
        
        var amount = args[0];

        if(!amount || amount.length <= 0) return message.reply("No amount specified!");

        var parsedAmount = parseInt(args[0]);
        var generatedCodes = "";
        var processed = 0;

        while (processed < parsedAmount) {
            processed++;
            if(processed == parsedAmount) {
                generatedCodes += `${generator.generate(24)}`;
                fs.writeFile('./keys.txt', generatedCodes, (error) => {
                    if(error) {
                        message.reply("There was an error!");
                        return;
                    }
                    message.reply("Done!");
                })
            } else {
                generatedCodes += `${generator.generate(24)},\n`;
            }
        }
    }
});

bot.login(process.env.token);
