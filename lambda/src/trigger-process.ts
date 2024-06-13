import { StartInstancesCommand, EC2Client } from "@aws-sdk/client-ec2";

import * as aws from "@pulumi/aws";



export async function handleTrigger(event:any)  {
    
    event.Records.map(async (record: { eventID: any; eventName: any; dynamodb: any; }) => {
        if(record.eventName != 'INSERT') {
            return;
        }
        console.log('Event Id: %s', record.eventID);
        console.log('Event Id: %s', record.eventName);
        console.log('DynamoDB Record: %j', record.dynamodb);

        const instanceId = process.env.INSTANCE_ID!;
        const command = new StartInstancesCommand({
            // Use DescribeInstancesCommand to find InstanceIds
            InstanceIds: [instanceId],
            });
        const client = new EC2Client();
        // Add your user data commands here
        const userDataCommands = [
            'sudo yum install -y aws-cli',
            `aws s3 cp s3://${process.env.BUCKET_PATH}/script.sh .`, // Download script from S3
            'chmod +x script.sh', // Make the script executable
            'export ID=' + record.dynamodb.Keys.id.S, // Set the environment variable
            './script.sh' // Execute the script
        ];
        // Run the commands on the started instance
        await runCommandsOnInstance(instanceId, userDataCommands);


        try {
            console.log(`instance id:${instanceId}`);
            const { StartingInstances } = await client.send(command);
            console.log(`Starting instance`);
            return StartingInstances;
        } catch (err) {
            console.error(err);
        }
    });

};

async function runCommandsOnInstance(instanceId: string, commands: string[]) {
    const runCommand = new aws.ssm.Command("run-command-on-instance", {
        commands: commands,
        instanceIds: [instanceId],
        documentName: "AWS-RunShellScript",
        cloudWatchOutputEnabled: true,
    });

    // Wait for the command to complete
    const commandResult = await runCommand.onEvent('success', {}, async () => {
        const result = await aws.ssm.getCommandInvocation({
            commandId: runCommand.commandId,
            instanceId: instanceId,
        });

        return result.commandPlugins?.[0].output;
    });

    if (commandResult) {
        console.log(`Command output: ${commandResult}`);
    } else {
        console.log("Command execution failed or timed out.");
    }
}
    