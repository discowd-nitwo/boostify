import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";
import { Command } from "../libs/loadCommands.js";

const PERMISSIONS = [
  { flag: PermissionFlagsBits.Administrator, label: "Administrator" },
  { flag: PermissionFlagsBits.ManageGuild, label: "Manage Server" },
  { flag: PermissionFlagsBits.ManageRoles, label: "Manage Roles" },
  { flag: PermissionFlagsBits.ManageChannels, label: "Manage Channels" },
  { flag: PermissionFlagsBits.ManageMessages, label: "Manage Messages" },
  { flag: PermissionFlagsBits.ManageNicknames, label: "Manage Nicknames" },
  { flag: PermissionFlagsBits.ManageWebhooks, label: "Manage Webhooks" },
  {
    flag: PermissionFlagsBits.ManageEmojisAndStickers,
    label: "Manage Emojis & Stickers",
  },
  { flag: PermissionFlagsBits.KickMembers, label: "Kick Members" },
  { flag: PermissionFlagsBits.BanMembers, label: "Ban Members" },
  {
    flag: PermissionFlagsBits.ModerateMembers,
    label: "Moderate Members (Timeout)",
  },
  { flag: PermissionFlagsBits.MentionEveryone, label: "Mention Everyone" },
  { flag: PermissionFlagsBits.ViewAuditLog, label: "View Audit Log" },
  { flag: PermissionFlagsBits.ViewChannel, label: "View Channels" },
  { flag: PermissionFlagsBits.SendMessages, label: "Send Messages" },
  {
    flag: PermissionFlagsBits.SendMessagesInThreads,
    label: "Send Messages in Threads",
  },
  { flag: PermissionFlagsBits.EmbedLinks, label: "Embed Links" },
  { flag: PermissionFlagsBits.AttachFiles, label: "Attach Files" },
  {
    flag: PermissionFlagsBits.ReadMessageHistory,
    label: "Read Message History",
  },
  { flag: PermissionFlagsBits.AddReactions, label: "Add Reactions" },
  { flag: PermissionFlagsBits.UseExternalEmojis, label: "Use External Emojis" },
  {
    flag: PermissionFlagsBits.UseApplicationCommands,
    label: "Use Application Commands",
  },
  { flag: PermissionFlagsBits.Connect, label: "Connect (Voice)" },
  { flag: PermissionFlagsBits.Speak, label: "Speak (Voice)" },
  { flag: PermissionFlagsBits.MuteMembers, label: "Mute Members (Voice)" },
  { flag: PermissionFlagsBits.DeafenMembers, label: "Deafen Members (Voice)" },
  { flag: PermissionFlagsBits.MoveMembers, label: "Move Members (Voice)" },
  { flag: PermissionFlagsBits.CreateInstantInvite, label: "Create Invite" },
  { flag: PermissionFlagsBits.ChangeNickname, label: "Change Own Nickname" },
];

const debugCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("debug")
    .setDescription("Debug utilities")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName("permissions")
        .setDescription("Check the bot's permissions in this server"),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "permissions") {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      try {
        const botMember = interaction.guild?.members.me;
        if (!botMember) {
          await interaction.editReply(
            "Could not resolve bot member data in this server.",
          );
          return;
        }

        const botPerms = botMember.permissions;
        const lines = PERMISSIONS.map(({ flag, label }) => {
          const has = botPerms.has(flag);
          return `${has ? "✅" : "❌"} ${label}`;
        });

        const isAdmin = botPerms.has(PermissionFlagsBits.Administrator);
        const header = isAdmin
          ? "⚠️ Bot has **Administrator**!! this grants all permissions regardless!\n\n"
          : "";

        await interaction.editReply(
          `${header}**Bot permissions in ${interaction.guild?.name}:**\n\`\`\`\n${lines.join("\n")}\n\`\`\``,
        );
      } catch (error) {
        console.error("Permissions check failed:", error);
        await interaction.editReply("Failed to retrieve permissions.");
      }
    }
  },
};

export default debugCommand;
