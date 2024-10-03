# Features to Implement

## GuildSettings Model

### Leveling System

- [ ] Is Complete
  - [ ] Add a `levelingEnabled` toggle (Boolean) to enable/disable the leveling system.
  - [ ] Store `levelingRoles` (String) for roles granted at specific levels.
  - [ ] Add a `levelingChannelId` (String) to store the channel where leveling updates will be sent.
  - [ ] Add a `levelingMessage` (String) for the message format when a user levels up.

### Ticket System

- [ ] Is Complete
  - [ ] Add a `ticketEnabled` toggle (Boolean) to enable/disable the ticketing system.
  - [ ] Store `ticketCategory` (String) for the category where tickets are created.
  - [ ] Add `ticketLogChannelId` (String) for the channel where ticket logs are sent.
  - [ ] Add a `ticketLogMessage` (String) to format ticket log messages.
  - [ ] Add a `ticketLogEnabled` toggle (Boolean) to enable/disable ticket logs.

### Welcome System

- [ ] Is Complete
  - [ ] Add a `welcomeEnabled` toggle (Boolean) to enable/disable welcome messages.
  - [ ] Store `welcomeChannelId` (String) to specify the channel for welcome messages.
  - [ ] Add a `welcomeMessage` (String) to format the welcome message.

### Leave System

- [ ] Is Complete
  - [ ] Add a `leaveEnabled` toggle (Boolean) to enable/disable leave messages.
  - [ ] Store `leaveChannelId` (String) to specify the channel for leave messages.
  - [ ] Add a `leaveMessage` (String) to format the leave message.

### Auto Role System

- [ ] Is Complete
  - [ ] Add an `autoRoleEnabled` toggle (Boolean) to enable/disable auto-assigning roles.
  - [ ] Store `autoRoleRoles` (String) for roles that will be auto-assigned on join.
