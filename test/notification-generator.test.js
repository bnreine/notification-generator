const cdk = require('aws-cdk-lib');
const { Template } = require('aws-cdk-lib/assertions');
const { NotificationGeneratorStack } = require('../lib/notification-generator-stack');

test('NotificationGeneratorStack synthesizes empty template', () => {
  const app = new cdk.App();
  const stack = new NotificationGeneratorStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);

  template.resourceCountIs('*', 0);
});
