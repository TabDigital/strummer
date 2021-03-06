var enumer = require('../../lib/matchers/enum');

describe('enum matcher', function() {

  var valid = ['blue', 'red', 'green'];

  it('fails to create the match if the arguments are invalid', function() {
    (function() {
      new enumer({values: null});
    }).should.throw('Invalid enum values: null');
    (function() {
      new enumer({values: 'blue'});
    }).should.throw('Invalid enum values: blue');
  });

  it('matches from a list of values', function() {
    new enumer({values: valid}).match('', 'blue').should.not.have.error();
    new enumer({values: valid}).match('', 'red').should.not.have.error();
    new enumer({values: valid}).match('', 'green').should.not.have.error();
    new enumer({values: valid}).match('', 'yellow').should.have.error(/should be a valid enum value/);
  });

  it('can give the enum a name for better errors', function() {
    m = new enumer({
      values: valid,
      name: 'color'
    });
    m.match('', 'yellow').should.have.error(/should be a valid color/);
  });

  it('can return the full list of allowed values', function() {
    m = new enumer({
      values: valid,
      verbose: true
    });
    m.match('', 'yellow').should.have.error(/should be a valid enum value \(blue,red,green\)/);
  });

  it('can combined both name and verbose', function() {
    m = new enumer({
      values: valid,
      name: 'color',
      verbose: true
    });
    m.match('', 'yellow').should.have.error(/should be a valid color \(blue,red,green\)/);
  });

  it('generates enum json schema', function() {
    new enumer({
      values: ['foo', 'bar', 'brillian', 'kiddkai']
    }).toJSONSchema().should.eql({
      enum: ['foo', 'bar', 'brillian', 'kiddkai']
    });
  });

  it('generates enum json schema with optional description', function() {
    new enumer({
      values: ['foo', 'bar', 'brillian', 'kiddkai'],
      description: 'Lorem ipsum'
    }).toJSONSchema().should.eql({
      enum: ['foo', 'bar', 'brillian', 'kiddkai'],
      description: 'Lorem ipsum'
    });
  });

  it('generates enum json schema with optional type', function() {
    new enumer({
      values: ['foo', 'bar', 'brillian', 'kiddkai'],
      type: 'string'
    }).toJSONSchema().should.eql({
      enum: ['foo', 'bar', 'brillian', 'kiddkai'],
      type: 'string'
    });
  });

});
