const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const readline = require('readline');


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let dryRun = true;

init();

async function init() {
  if (process.argv.length < 3) {
    console.log(
      `
      Usage: 
        node delete-team.js [options] <teamId> [teamId]
        npm run delete-team -- [options] <teamId> [teamId]
        
      Options:
        --apply: Run the script to apply changes
        `
    );
    console.log(
      `
      Example: 
        node delete-team.js --apply 01850e43-d1e0-4b92-abe5-271b159ff99b
        npm run delete-team -- --apply 01850e43-d1e0-4b92-abe5-271b159ff99b
        `
    );
    process.exit(1);
  } else {
    let i = 2;
    if (process.argv.map((a) => a.toLowerCase()).includes('--apply')) {
      console.log('Running in apply mode');
      dryRun = false;
      i++;
    } else {
      console.log('Running in dry-run mode');
      dryRun = true;
    }
    for (i; i < process.argv.length; i++) {
      const teamId = process.argv[i];
      try {
        await displayDeletionArtifacts(teamId);

        if (!dryRun) {
          const confirmed = await askForConfirmation(teamId);
          if (confirmed) {
            await handleTeamDeletion(teamId);
          }
        }
      } catch (error) {
        console.log('Error deleting team:', error?.message);
      }
    }
    await prisma.$disconnect();
    console.log('\nDisconnected from database');
    process.exit(0);
  }
}

async function displayDeletionArtifacts(teamId) {
  // Team Details
  const team = await getTeamById(teamId);
  if (!team) {
    throw new Error(`Team not found: ${teamId}`);
  }
  console.log('\nTeam Details:');
  printTable([team], ['id', 'name', 'billingId']);

  if (team?.billingId) {
    // Active Subscriptions
    const activeSubscriptions = await getActiveSubscriptions(team);
    if (activeSubscriptions.length > 0) {
      console.log('\nActive Subscriptions:');
      printTable(activeSubscriptions, ['id', 'startDate', 'endDate']);
    } else {
      console.log('\nNo active subscriptions found');
    }

    // All subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: {
        customerId: team?.billingId,
      },
    });
    if (subscriptions.length > 0) {
      console.log('\nAll Subscriptions:');
      printTable(subscriptions, ['id', 'startDate', 'endDate', 'active']);
    } else {
      console.log('\nNo subscriptions found');
    }
  } else {
    console.log('\nNo billingId found');
  }

  // Team Members
  const teamMembers = await prisma.user.findMany({
    where: {
      teamMembers: {
        some: {
          teamId: team.id,
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
  for (let i = 0; i < teamMembers.length; i++) {
    const user = teamMembers[i];
    const userTeams = await prisma.teamMember.findMany({
      where: {
        userId: user.id,
      },
    });
    teamMembers[i].teams = userTeams.length;
    teamMembers[i].action = userTeams.length > 1 ? 'Remove' : 'Delete';
  }
  console.log('\nTeam Members:');
  printTable(teamMembers, ['id', 'email', 'name', 'teams', 'action']);

  const apiKeys = await prisma.apiKey.findMany({ where: { teamId: team.id } });
  if (apiKeys.length > 0) {
    console.log('\nAPI Keys:');
    printTable(apiKeys, ['id', 'name']);
  } else {
    console.log('\nNo API keys found');
  }

  const invitations = await prisma.invitation.findMany({
    where: { teamId: team.id },
  });
  if (invitations.length > 0) {
    console.log('\nInvitations:');
    printTable(invitations, ['id', 'email', 'role']);
  } else {
    console.log('\nNo invitations found');
  }

}

async function handleTeamDeletion(teamId) {
  console.log(`\nChecking team: ${teamId}`);
  let team = await getTeamById(teamId);
  if (!team) {
    console.log(`Team not found: ${teamId}`);
    return;
  } else {
    console.log('Team found:', team.name);
    if (team?.billingId) {
      console.log('\nChecking active team subscriptions');
      const activeSubscriptions = await getActiveSubscriptions(team);
      if (activeSubscriptions.length > 0) {
        console.log(
          `${activeSubscriptions.length} Active subscriptions found. Please cancel them before deleting the team.`
        );
        printTable(activeSubscriptions, ['id', 'startDate', 'endDate']);
        return;
      } else {
        console.log('No active subscriptions found');
      }
    }

    await removeTeamSubscriptions(team);
    await removeTeamMembers(team);

    await removeTeam(team);
  }
}

async function getTeamById(teamId) {
  return await prisma.team.findUnique({
    where: {
      id: teamId,
    },
  });
}

async function removeTeam(team) {
  console.log('\nDeleting team:', team.id);
  await prisma.team.delete({
    where: {
      id: team.id,
    },
  });
  console.log('Team deleted:', team.name);
}

async function removeTeamSubscriptions(team) {
  console.log('\nDeleting team subscriptions');
  if (team?.billingId) {
    await prisma.subscription.deleteMany({
      where: {
        customerId: team?.billingId,
      },
    });
  }
  console.log('Team subscriptions deleted');
}

async function getActiveSubscriptions(team) {
  return await prisma.subscription.findMany({
    where: {
      customerId: team?.billingId,
      active: true,
      endDate: {
        gt: new Date(),
      },
    },
    select: {
      id: true,
      customerId: true,
      startDate: true,
      endDate: true,
      priceId: true,
    },
  });
}

async function removeTeamMembers(team) {
  console.log('\nChecking team members');

  const teamMembers = await prisma.user.findMany({
    where: {
      teamMembers: {
        some: {
          teamId: team.id,
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
  console.log(`Found ${teamMembers.length} team members`);
  printTable(teamMembers);

  for (const user of teamMembers) {
    await checkAndRemoveUser(user, team);
  }
}

async function checkAndRemoveUser(user, team) {
  console.log('\nChecking user:', user.id);
  const userTeams = await prisma.teamMember.findMany({
    where: {
      userId: user.id,
    },
  });
  console.log(`User belongs to ${userTeams.length} teams`);
  if (userTeams.length === 1) {
    console.log('Deleting user:', user.email);
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
    console.log('User deleted:', user.email);
  } else {
    console.log('Removing user from team:', team.name);
    await prisma.teamMember.deleteMany({
      where: {
        userId: user.id,
        teamId: team.id,
      },
    });
    console.log('User removed from team:', team.name);
  }
}


async function askForConfirmation(teamId) {
  return new Promise((resolve) => {
    rl.question(
      `Are you sure you want to delete team ${teamId}? (yes/no): `,
      (answer) => {
        if (answer.toLowerCase() === 'yes') {
          resolve(true);
        } else {
          console.log('Deletion canceled.');
          resolve(false);
        }
        rl.close();
      }
    );
  });
}

function printTable(data, columns) {
  const final = {};
  data.forEach((ele, index) => {
    final[index + 1] = ele;
  });
  console.table(final, columns);
}

// handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
