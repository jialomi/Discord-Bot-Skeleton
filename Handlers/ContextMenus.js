const { glob } = require('glob');
const path = require('path');
const AsciiTable = require('ascii-table');
const { Collection, REST, Routes } = require('discord.js');
const log = require('../Addons/Logger');
const { GuildEnums } = require('../Addons/Enums');

/** 
 * Object with arrays of application interactions commands.
 * @use for registerGuildCmds().
 */
const contextAppCommands = {
    GLOBAL: [],
    TEA: [],
    TEST: [],
}; // Object with interaction commands arrays.

/**
 * Loadds application interaction command handler.
 * @param {Discord.Client} client - The Discord.js client instance.
 * @returns {Promise<string>} - A promise that resolves with a table of loaded commands as a string, or rejects with an error message.
 * @example await loadAppCmds(client).then(function).catch(error);
 */
async function loadContextAppCmds(client) {
    //eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        log.debug('[LOAD CONTEXT MENU COMMANDS] Started loading application interaction command handler.');

        // Create a new table
        const table = new AsciiTable('Application Interaction Context Menu Commands');
        table.setHeading('Status', 'Guild', 'Name', 'File');

        function tableAddRow(contextCommand, file) {
            // Add table row for this command.
            table.addRow(
                contextCommand.enabled ? 'ENABLED' : 'DISABLED',
                contextCommand.guild,
                contextCommand.data.name,
                file.split('/').slice(-1).join('/')
            );
        }

        // Application interaction collection.
        client.contextCommands = new Collection();

        try {
            // Load application interaction slash commands files.
            const appContextCmdFiles = await glob('Interactions/ContextMenus/**/*.js');

            for (const file of appContextCmdFiles) {
                try {
                    // Get full path to the command file
                    const cmd_dir_root = path.join(process.cwd(), file);

                    // Assign variable to command file.
                    const contextCommand = require(cmd_dir_root);

                    // Check if command has name.
                    if (!contextCommand.data?.name) {
                        log.bug('This command doesn\'t have a name variable:', file);
                        continue;
                    }

                    // Log command being loaded.
                    log.debug(`[LOAD COMMANDS] Loaded '${contextCommand.data.name}' application interaction command.`);

                    // Check if command is disabled.
                    if (!contextCommand.enabled) {
                        continue;
                    }

                    // Set command into contextCommands collector.
                    client.contextCommands.set(contextCommand.data.name, contextCommand)
                    
                    // Finally split contextCommands into seperate categories
                    switch(contextCommand.guild) {
                        case GuildEnums.GLOBAL: {
                            contextAppCommands.GLOBAL.push(contextCommand.data.toJSON());
                            tableAddRow(contextCommand, file);
                            break;
                        }
                        case GuildEnums.TEA: {
                            contextAppCommands.TEA.push(contextCommand.data.toJSON());
                            tableAddRow(contextCommand, file);
                            break;
                        }
                        case GuildEnums.TEST: {
                            contextAppCommands.TEST.push(contextCommand.data.toJSON());
                            tableAddRow(contextCommand, file);
                            break;
                        }
                        default:
                            log.warn(`Command '${contextCommand.data.name}' has unhandled guild parameter set:`, `'${contextCommand?.guild}' and is not loaded`);
                            // Add table row for this invalid command.
                            table.addRow(
                                'INVALID',
                                contextCommand?.guild,
                                contextCommand.data.name,
                                file.split('/').slice(-1).join('/')
                            );
                            break;
                    }
                } catch (error) {
                    reject(`Error loading application interaction command file '${file}': ${error.message}`);
                }
            }

            // Send a log when there are no commands loaded
            if (client.contextCommands.size === 0) {
                resolve('[LOAD CONTEXT MENU COMMANDS] ❌ No enabled interaction context menu commands were found.');
            } else {
                resolve(table.toString());
            }
        } catch (error) {
            reject(`Error loading application interaction command files: ${error.message}`);
        }
        
        log.debug('🆗 [LOAD COMMANDS] Finished loading application interaction command handler.');
    });
}

// Create rest variable for application context menu registry.
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_APP_TOKEN);

/**
 * Refreshes guild interaction commands.
 * @param {Array} commands - An array of guild interaction commands to be registered.
 * @param {String} guildID - String with the guild ID.
 * @param {String} friendlyName - String with the name of the guild to easy recognition.
 * @returns {Promise} - A promise that resolves with a success message, or rejects with an error message.
 * @example await registerGuildCmds(cmds, '1234567890', 'some club name').then(function).catch(error);
 */
async function registerGuildContextCmds(contextCommands, guildID, friendlyName) {
    return new Promise((resolve, reject) => {
        log.debug(`[REGISTER GUILD CONTEXT MENU COMMANDS] Started refreshing '${friendlyName}' specific application guild commands.`);
        
        setTimeout(async () => { // 1 second timeout for each command registry API request.
            try {
                await rest.put(
                    Routes.applicationGuildCommand(process.env.DISCORD_APP_ID, guildID),
                    { body: contextCommands ? contextCommands : [] }
                );
    
                resolve(`[REGISTER GUILD CONTEXT MENU COMMANDS] ✅ Successfully refreshed '${friendlyName}' specific application guild commands.`, commands);
            } catch (err) {
                reject(`[REGISTER GUILD CONTEXT MENU COMMANDS] Error to refresh '${friendlyName}' specific application guild commands: ${err.message}`);
            }
        },1000);
    });
}

/**
 * Refreshes global interaction commands.
 * @param {Array} commands - An array of global interaction commands to be registered.
 * @returns {Promise} - A promise that resolves with a success message, or rejects with an error message.
* @example await registerGlobalCmds().then(function).catch(error);
*/
const registerGlobalContextCmds = commands =>
    new Promise((resolve, reject) => {
        log.debug('[REGISTER GLOBAL CONTEXT MENU COMMANDS] Started refreshing global application commands.');

        (async () => {
            try {
                await rest.put(
                    Routes.applicationCommands(process.env.DISCORD_APP_ID),
                    { body: commands ? commands : [] }
                );

                resolve('[REGISTER GLOBAL CONTEXT MENU COMMANDS] ✅ Successfully refreshed GLOBAL application commands.', commands);
            } catch (err) {
                reject(`[REGISTER GLOBAL CONTEXT MENU COMMANDS] Error to refresh global application commands: ${err.message}`);
            }
        })();
    });

module.exports = {
    loadContextAppCmds,
    registerGuildContextCmds,
    registerGlobalContextCmds,
    contextAppCommands,
};