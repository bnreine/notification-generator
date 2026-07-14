const {
  Stack,
  Fn,
  aws_ec2: ec2,
  aws_ecs: ecs,
  aws_sqs: sqs,
  aws_ssm: ssm,
  aws_logs: logs,
    aws_iam
} = require('aws-cdk-lib');
const secretsmanager = require('aws-cdk-lib/aws-secretsmanager')

const ECS_CLUSTER_NAME_EXPORT = 'SharedNotificationClusterName';
const CAPACITY_PROVIDER_NAME_EXPORT = 'EcsNotificationCapacityProvider';
const GENERATOR_QUEUE_SSM_PARAMETER = '/notifications/NotificationGeneratorQueue/arn';
const DELIVERY_QUEUE_SSM_PARAMETER = '/notifications/NotificationDeliveryQueue/arn';

class NotificationGeneratorStack extends Stack {
  /**
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

      const finnhubSecret = new secretsmanager.Secret(this, 'FinnhubApiKeySecret', {
          secretName: 'finnhub-api-key',
          description: 'Finnhub API key'
      });

      const RDSWriteReadCredentialsSecret = secretsmanager.Secret.fromSecretCompleteArn(
          this,
          'RDSWriteReadCredentialsSecret',
          'arn:aws:secretsmanager:us-east-1:010273536955:secret:write_read_rds_db-IyAK3D'
      );

      const vpc = ec2.Vpc.fromLookup(this, 'Vpc', {
          vpcId: 'vpc-084bacc70db0dcefd',
      });

    const cluster = ecs.Cluster.fromClusterAttributes(this, 'Cluster', {
      clusterName: Fn.importValue(ECS_CLUSTER_NAME_EXPORT),
      vpc,
      securityGroups: [],
    });


    const generatorQueueArn = ssm.StringParameter.valueForStringParameter(this, GENERATOR_QUEUE_SSM_PARAMETER);
    const notificationGeneratorQueue = sqs.Queue.fromQueueArn(this, 'NotificationsGeneratorQueue', generatorQueueArn);


      const deliveryQueueArn = ssm.StringParameter.valueForStringParameter(this, DELIVERY_QUEUE_SSM_PARAMETER);
      const notificationDeliveryQueue = sqs.Queue.fromQueueArn(this, 'NotificationsDeliveryQueue', deliveryQueueArn);


      const logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: '/ecs/notification-generator',
      retention: logs.RetentionDays.ONE_WEEK,
    });
    //
    //
    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'TaskDefinition', {});

    taskDefinition.addContainer('App', {
      image: ecs.ContainerImage.fromAsset('.', { file: 'Dockerfile' }),
      memoryReservationMiB: 256,
      logging: ecs.LogDrivers.awsLogs({
        logGroup,
        streamPrefix: 'notification-generator',
      }),
      environment: {
        NOTIFICATION_GENERATOR_QUEUE_URL: notificationGeneratorQueue.queueUrl,
          NOTIFICATION_DELIVERY_QUEUE_URL:  notificationDeliveryQueue.queueUrl
      },
    });

      taskDefinition.addToTaskRolePolicy(
          new aws_iam.PolicyStatement({
              actions: ['secretsmanager:GetSecretValue'],
              resources: [finnhubSecret.secretArn, RDSWriteReadCredentialsSecret.secretArn],
          }),
      );

      notificationGeneratorQueue.grantConsumeMessages(taskDefinition.taskRole);
      notificationDeliveryQueue.grantSendMessages(taskDefinition.taskRole);


    new ecs.Ec2Service(this, 'NotificationGeneratorService', {
      cluster,
      taskDefinition,
      desiredCount: 0,
      capacityProviderStrategies: [
        {
          capacityProvider: Fn.importValue(CAPACITY_PROVIDER_NAME_EXPORT),
          weight: 1,
        },
      ],
    });


  }
}

module.exports = { NotificationGeneratorStack };
