import {
  SlashCommandBuilder,
  ChatInputCommandInteraction, ColorResolvable,
  MessageFlags
} from "discord.js";
import { Command } from "../libs/loadCommands.js";
import { getBooster } from "../services/boosterService.js";
import {
  createCustomRole,
  updateCustomRole,
  deleteCustomRole,
} from "../services/roleService.js";

const roleCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Manage your custom booster role")
    .addSubcommand((sub) =>
      sub
        .setName("create")
        .setDescription("Create your custom role")
        .addStringOption((opt) =>
          opt.setName("name").setDescription("Role name").setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("color").setDescription("Hex color (e.g. #ff0000)").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("edit")
        .setDescription("Edit your custom role")
        .addStringOption((opt) =>
          opt.setName("name").setDescription("New role name").setRequired(false)
        )
        .addStringOption((opt) =>
          opt.setName("color").setDescription("New hex color").setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("delete").setDescription("Delete your custom role")
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const record = getBooster(interaction.user.id);

    if (!record?.boosting) {
      await interaction.reply({
        content: "You must be an active booster to use this command.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const sub = interaction.options.getSubcommand();
    const guild = interaction.guild!;
    const member = await guild.members.fetch(interaction.user.id);

    if (sub === "create") {
      if (record.customRoleId) {
        await interaction.reply({
          content: "You already have a custom role. Use /role edit to modify it.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const name = interaction.options.getString("name", true);
      const color = interaction.options.getString("color", true);

      if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
        await interaction.reply({
          content: "Invalid color. Please use a hex color like #ff0000.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const role = await createCustomRole(guild, member, name, color as ColorResolvable);

      await interaction.editReply(`Custom role ${role} created successfully.`);
      return;
    }

    if (sub === "edit") {
      if (!record.customRoleId) {
        await interaction.reply({
          content: "You do not have a custom role. Use /role create first.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const name = interaction.options.getString("name") ?? undefined;
      const color = (interaction.options.getString("color") ?? undefined) as ColorResolvable | undefined;

      if (color && !/^#[0-9a-fA-F]{6}$/.test(color as string)) {
        await interaction.reply({
          content: "Invalid color. Please use a hex color like #ff0000.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const role = await updateCustomRole(guild, interaction.user.id, name, color);
      if (!role) {
        await interaction.editReply("Failed to update role. It may have been deleted.");
        return;
      }

      await interaction.editReply(`Custom role updated successfully.`);
      return;
    }

    if (sub === "delete") {
      if (!record.customRoleId) {
        await interaction.reply({
          content: "You do not have a custom role.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      await deleteCustomRole(guild, interaction.user.id);
      await interaction.editReply("Custom role deleted.");
      return;
    }
  },
};

export default roleCommand;