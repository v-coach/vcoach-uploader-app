const OAuth2 = require('discord-oauth2');
const jwt = require('jsonwebtoken');

const oauth = new OAuth2({
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  redirectUri: process.env.SITE_URL + '/.netlify/functions/discord-auth',
});

const REQUIRED_ROLES = {
  coach: ['Coach', 'Head Coach'],
  admin: ['Founders'],
};

exports.handler = async (event) => {
  const { code } = event.queryStringParameters;

  // If no code, this is the initial login request. Redirect to Discord.
  if (!code) {
    const authUrl = oauth.generateAuthUrl({
      scope: ['identify', 'guilds', 'guilds.members.read'],
      state: 'some-random-state-string', // Recommended for security
    });
    return {
      statusCode: 302,
      headers: {
        Location: authUrl,
      },
    };
  }

  // If we have a code, exchange it for a token
  try {
    const tokenResponse = await oauth.tokenRequest({
      code,
      scope: 'identify guilds guilds.members.read',
      grantType: 'authorization_code',
    });

    const accessToken = tokenResponse.access_token;
    const user = await oauth.getUser(accessToken);
    const member = await oauth.getGuildMember(accessToken, process.env.DISCORD_GUILD_ID);

    const userRoles = member.roles.map(roleId => {
        const role = member.guild.roles.find(r => r.id === roleId);
        return role ? role.name : null;
    }).filter(Boolean);

    // Check for permissions
    const isCoach = userRoles.some(role => REQUIRED_ROLES.coach.includes(role));
    const isAdmin = userRoles.some(role => REQUIRED_ROLES.admin.includes(role));

    if (!isCoach && !isAdmin) {
      return {
        statusCode: 403,
        body: 'Access Denied: You do not have the required role.',
      };
    }

    // Create a JWT to store user info and roles
    const appToken = jwt.sign(
      {
        id: user.id,
        username: `${user.username}#${user.discriminator}`,
        avatar: user.avatar,
        roles: userRoles,
        isCoach,
        isAdmin,
      },
      process.env.JWT_SECRET, // A strong secret key for signing
      { expiresIn: '1d' } // Token expires in 1 day
    );

    // Redirect back to the frontend with the token
    const redirectUrl = `/?token=${appToken}`;
    return {
      statusCode: 302,
      headers: {
        Location: redirectUrl,
      },
    };
  } catch (error) {
    console.error('Discord Auth Error:', error);
    return {
      statusCode: 500,
      body: 'Authentication failed.',
    };
  }
};
