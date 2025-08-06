# Setting up MongoDB Atlas

This guide will help you set up a MongoDB Atlas cluster for your project.

## Creating a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account or log in.

## Creating a Cluster

1. Click on "Build a Cluster" and select the free tier option "Shared".
2. Choose a cloud provider (AWS, Google Cloud, or Azure) and a region close to your application's users.
3. Leave the default cluster tier (M0 Sandbox) and click "Create Cluster".
4. Wait for the cluster to be provisioned (this may take a few minutes).

## Setting up Database Access

1. In the left sidebar, click on "Database Access" under the "Security" section.
2. Click "Add New Database User" to create a user for your application.
3. Choose "Password" authentication method.
4. Enter a username and a secure password.
5. Set the user's privileges to "Read and write to any database".
6. Click "Add User" to create the database user.

## Configuring Network Access

1. In the left sidebar, click on "Network Access" under the "Security" section.
2. Click "Add IP Address".
3. For development, you can select "Allow Access from Anywhere" (0.0.0.0/0).
   - For production, you should restrict access to your application's IP address.
4. Click "Confirm" to save the IP whitelist entry.

## Getting the Connection String

1. In the left sidebar, click on "Clusters" under the "Data Storage" section.
2. Click "Connect" on your cluster.
3. Select "Connect your application".
4. Select "Node.js" as the driver and the appropriate version.
5. Copy the connection string provided.
6. Replace `<password>` with your database user's password and `<dbname>` with your database name.

## Setting up .env File

Add the connection string to your `.env` file in the server directory:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
```

Replace:
- `<username>`: Your MongoDB Atlas database username
- `<password>`: Your MongoDB Atlas database user's password
- `cluster0.mongodb.net`: Your MongoDB Atlas cluster URL
- `<dbname>`: Your database name (e.g., "nextjs-singleaudio2") 