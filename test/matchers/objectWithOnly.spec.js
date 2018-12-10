var objectWithOnly  = require('../../lib/matchers/objectWithOnly');
var array           = require('../../lib/matchers/array');
var string          = require('../../lib/matchers/string');
var number          = require('../../lib/matchers/number');
var optional        = require('../../lib/matchers/optional');
var Matcher         = require('../../lib/matcher');

describe('objectWithOnly object matcher', function() {

  it('cannot be called with anything but an object matcher', function() {
    (function() {
      var schema = new objectWithOnly('string');
    }).should.throw(/Invalid argument/);
  });

  it('returns error if the object matcher returns one', function() {
    var schema = new objectWithOnly({
      name: new string(),
      age:  new number()
    });

    schema.match('', 'bob').should.eql([{
      path: '',
      value: 'bob',
      message: 'should be an object'
    }]);
  });

  it('matches objects', function() {
    var schema = new objectWithOnly({
      name: new string(),
      age:  new number()
    });

    schema.match('', {name: 'bob', age: 21}).should.not.have.error();
  });

  it('allows missing keys if they are optional', function() {
    var schema = new objectWithOnly({
      name: new optional('string'),
      age:  new number()
    });

    schema.match('', {age: 21}).should.not.have.error();
  });

  it('rejects if there are extra keys', function() {
    var schema = new objectWithOnly({
      name: new string(),
      age:  new number()
    });

    schema.match('', {name: 'bob', age: 21, email: 'bob@email.com'}).should.eql([{
      path: 'email',
      value: 'bob@email.com',
      message: 'should not exist'
    }])
  });

  it('should not validate nested objects', function() {
    var schema = new objectWithOnly({
      name: new string(),
      age:  new number(),
      address: {
        email: new string()
      }
    });

    var bob = {
      name: 'bob',
      age: 21,
      address: {
        email: 'bob@email.com',
        home: '21 bob street'
      }
    }

    schema.match('', bob).should.not.have.error()
  });

  it('can be used within nested objects and arrays', function() {
    var schema = new objectWithOnly({
      name: 'string',
      firstBorn: new objectWithOnly({
        name: 'string',
        age: 'number'
      }),
      address: new array({of: new objectWithOnly({
        city: 'string',
        postcode: 'number'
      })})
    })

    var bob = {
      name: 'bob',
      firstBorn: {
        name: 'jane',
        age: 3,
        email: 'jane@bobismydad.com'
      },
      address: [{
        city: 'gosford',
        postcode: 2250,
        street: 'watt st'
      }]
    }
    schema.match('', bob).should.eql([{
      path: 'firstBorn.email',
      value: 'jane@bobismydad.com',
      message: 'should not exist'
    },{
      path: 'address[0].street',
      value: 'watt st',
      message: 'should not exist'
    }])
  })

  it('handles falsy return values from value matchers', function() {
    var valueMatcher = {
      __proto__: new Matcher({}),
      match: function() {}
    };

    new objectWithOnly({
      name: valueMatcher
    }).match('', {
      name: 'bob'
    }).should.eql([])
  });

  it('generates the object json schema but with additionalProperties which sets false', function() {
    new objectWithOnly({
      foo: 'string'
    }).toJSONSchema().should.eql({
      type: 'object',
      properties: {
        foo: {
          type: 'string'
        }
      },
      required: ['foo'],
      additionalProperties: false
    });
  });

  it('handles valid relationships', function() {
    var schema = new objectWithOnly({
      name: new string(),
      street_number: new number({ optional: true }),
      street_post_code: new number({ optional: true })
    })

    var bob = {
      name: 'bob',
      street_number: 12,
      street_post_code: 2001
    }

    var relationships = [
      {
        type: 'and',
        values: ['street_number', 'street_post_code']
      }
    ]

    schema.match('', bob, relationships).should.eql([])
  });

  it('gets errors on invalid relationships', function() {
    var schema = new objectWithOnly({
      name: new string(),
      street_number: new number({ optional: true }),
      street_post_code: new number({ optional: true })
    })

    var bob = {
      name: 'bob',
      street_number: 12
    }

    var relationships = [
      {
        type: 'and',
        values: ['street_number', 'street_post_code']
      }
    ]

    schema.match('', bob, relationships).should.eql([
      {
        message: '["street_number","street_post_code"] are related and therefore required',
        path: '',
        value: [
          'street_number',
          'street_post_code'
        ]
      }
    ])
  });
});
