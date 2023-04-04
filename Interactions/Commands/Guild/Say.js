const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord-api-types/v9');
const log = require('../../../Addons/Logger');
module.exports = {
    enabled: true,
    category: 'GUILD',
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Say something as the bot (at least one argument must be filled).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((option) =>
            option
                .setName('text')
                .setDescription('Optional type text to send')
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('attachment')
                .setDescription('Optional link to the message attachment')
                .setRequired(false)
        ),

    async execute(client, interaction, args) {
        const { user, guild } = interaction;

        // Log who used the command.
        log.info(`[/SAY] Command used by '${user?.tag}' on the ${guild?.name ? `'${guild.name}' guild.` : 'direct message.'}`);

        try {
            // Create reply to defer the command execution.
            const reply = await interaction.reply({ content: 'Sending message...', ephemeral: true });

            if (!interaction.channel) {
                throw new Error('Interaction channel is undefined.');
            }

            // Assign values to variables.
            const content = args[0] ?? null;
            const files = args[1] ? [args[1]] : [];

            // Send channel message.
            await interaction.channel.send({ content, files });

            // Edit the reply to indicate success.
            await reply.edit({ content: '✅ Your message has been sent correctly.' });
        } catch (error) {
            log.bug('[/SAY] Interaction error:', error);

            // Send an error message to the user.
            await interaction.editReply({
                content: '🥶 Something went wrong with this interaction. Please try again later.',
                ephemeral: true
            }).catch((editError) => log.bug(`[/SAY] Error editing interaction reply: ${editError}`));
        }
    },
};