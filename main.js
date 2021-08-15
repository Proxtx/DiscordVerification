import { generate } from "./captcha.js";
import { config } from "./lib.js";
import discord from "discord.js";

const client = new discord.Client({
  intents: [discord.Intents.FLAGS.GUILDS],
});

let verifyCodes = {};

const infoEmbed = new discord.MessageEmbed()
  .setColor("#B4C952")
  .setTitle("Spck Verification System")
  .setAuthor(
    "Proxtx#3013",
    "http://ni-si.ddnss.de/images/proxtx.png",
    "http://ni-si.ddnss.de"
  )
  .setDescription(
    "You need to verify you account to gain access to the Spck - Official Server"
  )
  .addFields(
    {
      name: "How to verify",
      value:
        "The bot send you an image: Please enter send the text in the image.",
    },
    {
      name: "How to get a new image",
      value: "Just write verify in the #verify channel",
    }
  )
  .setTimestamp()
  .setFooter("Spck Official");

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (msg) => {
  if (msg.author.id == client.user.id) return;
  if (
    (msg.content == "!verify" ||
      msg.content == "! verify" ||
      msg.content == "verify" ||
      msg.content == "/verify") &&
    msg.channel.type != "dm"
  ) {
    sendVerify(msg.member);
  }
  checkVerify(msg);
});

client.on("guildMemberAdd", (member) => sendVerify(member));

const sendVerify = (member) => {
  verifyCodes[member.id] = {
    code: generate("save.png"),
    member: member,
    tries: 0,
  };
  console.log("Code: " + verifyCodes[member.id].code);
  member.send(infoEmbed);
  member.send({ files: ["./save.png"] });
};

const checkVerify = (msg) => {
  if (msg.channel.type === "dm") {
    if (
      (!config.caseSensitive &&
        msg.content.toLocaleUpperCase() == verifyCodes[msg.author.id].code) ||
      (config.caseSensitive && msg.content == verifyCodes[msg.author.id].code)
    ) {
      msg.author.send("Verified");
      let role = verifyCodes[msg.author.id].member.guild.roles.cache.find(
        (role) => role.id === config.role
      );
      if (!role) return;
      verifyCodes[msg.author.id].member.roles.add(role);
    } else {
      msg.author.send("Wrong Code");
      verifyCodes[msg.author.id].tries++;
      if (verifyCodes[msg.author.id].tries >= config.tries) {
        sendVerify(verifyCodes[msg.author.id].member);
      }
    }
  }
};

client.login(config.token);

generate("save.png");
