const {
  Stack,
  Fn,
  aws_ec2: ec2,
  aws_ecs: ecs,
  aws_sqs: sqs,
  aws_ssm: ssm,
  aws_logs: logs,
} = require('aws-cdk-lib');

const ECS_CLUSTER_NAME_EXPORT = 'SharedNotificationClusterName';
const CAPACITY_PROVIDER_NAME_EXPORT = 'EcsNotificationCapacityProvider';
const QUEUE_SSM_PARAMETER = '/notifications/NotificationGeneratorQueue/arn';

class NotificationGeneratorStack extends Stack {
  /**
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

      const vpc = ec2.Vpc.fromLookup(this, 'Vpc', {
          vpcId: 'vpc-084bacc70db0dcefd',
      });

    const cluster = ecs.Cluster.fromClusterAttributes(this, 'Cluster', {
      clusterName: Fn.importValue(ECS_CLUSTER_NAME_EXPORT),
      vpc,
      securityGroups: [],
    });


    const queueArn = ssm.StringParameter.valueForStringParameter(this, QUEUE_SSM_PARAMETER);
    const queue = sqs.Queue.fromQueueArn(this, 'NotificationsGeneratorQueue', queueArn);

    const logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: '/ecs/notification-generator',
      retention: logs.RetentionDays.ONE_WEEK,
    });


    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'TaskDefinition', {});

    taskDefinition.addContainer('App', {
      image: ecs.ContainerImage.fromAsset('.', { file: 'Dockerfile' }),
      memoryReservationMiB: 256,
      logging: ecs.LogDrivers.awsLogs({
        logGroup,
        streamPrefix: 'notification-generator',
      }),
      environment: {
        QUEUE_URL: queue.queueUrl,
      },
    });

    queue.grantConsumeMessages(taskDefinition.taskRole);

    new ecs.Ec2Service(this, 'Service', {
      cluster,
      taskDefinition,
      desiredCount: 1,
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
