const cdk = require('aws-cdk-lib');
const { Template, Match } = require('aws-cdk-lib/assertions');
const { NotificationGeneratorStack } = require('../lib/notification-generator-stack');

test('NotificationGeneratorStack creates ECS service and task definition', () => {
  const app = new cdk.App();
  const stack = new NotificationGeneratorStack(app, 'MyTestStack', {
    env: { account: '010273536955', region: 'us-east-1' },
  });
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::ECS::Service', 1);
  template.resourceCountIs('AWS::ECS::TaskDefinition', 1);
  template.hasResourceProperties('AWS::ECS::Service', {
    DesiredCount: 1,
    CapacityProviderStrategy: Match.arrayWith([
      Match.objectLike({
        CapacityProvider: { 'Fn::ImportValue': 'EcsNotificationCapacityProviderName' },
        Weight: 1,
      }),
    ]),
  });
  template.hasResourceProperties('AWS::ECS::TaskDefinition', {
    RequiresCompatibilities: ['EC2'],
    ContainerDefinitions: Match.arrayWith([
      Match.objectLike({
        LogConfiguration: Match.objectLike({
          LogDriver: 'awslogs',
        }),
      }),
    ]),
  });
});
