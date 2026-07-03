const { Stage } = require('aws-cdk-lib');
const { NotificationGeneratorStack } = require('./notification-generator-stack');

class ProductionStage extends Stage {
  constructor(scope, id, props) {
    super(scope, id, props);

    new NotificationGeneratorStack(this, 'NotificationGeneratorStack', props);
  }
}

module.exports = { ProductionStage };
