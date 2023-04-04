const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const log = require('../../Addons/Logger');

async function showExampleModal(interaction) {

    // Make a modal using the discord builder module.
    try {
        // Create the modal
        const exampleModal = new ModalBuilder()
            .setCustomId('exampleModal')
            .setTitle('My example modal');

        // Create the text input components
        const favoriteColorInput = new TextInputBuilder()
            .setCustomId('favoriteColorInput')
            // The label is the prompt the user sees for this input
            .setLabel('What\'s your favorite color?')
            // Short means only a single line of text
            .setStyle(TextInputStyle.Short);

        const hobbiesInput = new TextInputBuilder()
            .setCustomId('hobbiesInput')
            .setLabel('What\'s some of your favorite hobbies?')
            // Paragraph means multiple lines of text.
            .setStyle(TextInputStyle.Paragraph);

        // An action row only holds one text input,
        // so you need one action row per text input.
        const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);
        const secondActionRow = new ActionRowBuilder().addComponents(hobbiesInput);

        // Add inputs to the modal.
        exampleModal.addComponents(firstActionRow, secondActionRow);

        // Show the modal to the user.
        await interaction.showModal(exampleModal);

    } catch (error) {
        // Catch any potential errors.
        log.bug('[exampleModal] Interaction error:', error);

        // Send an error message to the user.
        await interaction.reply({
            content: '🥶 Something went wrong with this interaction. Please try again later.',
            ephemeral: true
        }).catch((editError) => log.bug(`[exampleModal] Error sending interaction reply: ${editError}`));
    }
}

// Export logic that will be executed when the modal is submitted.
module.exports = {
    enabled: true,
    name: 'exampleModal',
    showExampleModal, // Function to show modal to the user. Used on different files as: showExampleModal(interaction)
    async execute(client, interaction) { // That handles the interation submit response.

        try {
            // Get the data entered by the user
            const favoriteColor = interaction.fields.getTextInputValue('favoriteColorInput');
            const hobbies = interaction.fields.getTextInputValue('hobbiesInput');

            // Log user arguments to the console.
            log.info({ favoriteColor, hobbies });

            // Send a message confirming that the form has been submitted successfully.
            await interaction.reply({ content: 'You submitted the example modal!', ephemeral: true });

        } catch (error) {
            // Catch any potential errors.
            log.bug('[exampleModal] Error to run this modal.', error);
        }
    }
};