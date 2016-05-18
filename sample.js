'use strict';

var DonationBox = React.createClass({
  displayName: 'DonationBox',

  handleDonationSubmit: function handleDonationSubmit(donation) {
    //this is just an example of how you would submit a form
    //you would have to implement something separately on the server
    alert('handleDonationSubmit');
    $.ajax({
      url: 'https://tanicompany-developer-edition.ap2.force.com/services/apexrest/testform/',
      dataType: 'json',
      type: 'POST',
      data: donation,
      async: 'false',
      origin: 'https://cdn.rawgit.com',
      success: function (data) {
        //this.setState({data: data});
        alert('success');
      }.bind(this),
      error: function (xhr, status, err) {
        alert('error');
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function getInitialState() {
    //this is not currently used, but you could display donations in real time
    //by updating the state of the donation data when the form is submitted,
    //then poll the server for new donations.
    return { data: [] };
  },
  render: function render() {
    return React.createElement(
      'div',
      { className: 'donationBox' },
      React.createElement(DonationForm, { onDonationSubmit: this.handleDonationSubmit })
    );
  }
});

var DonationForm = React.createClass({
  displayName: 'DonationForm',

  getInitialState: function getInitialState() {
    //we are only saving the contributor as an example
    //of how to save data changes for final submission
    return {
      contributor: ""
    };
  },
  handleSubmit: function handleSubmit(e) {
    //we don't want the form to submit, so we prevent the defaul behavior
    e.preventDefault();
    var contributor = this.state.contributor.trim();
    if (!contributor) {
      return;
    }

    //Here we do the final submit to the parent component
    this.props.onDonationSubmit({ contributor: contributor });
  },
  validateEmail: function validateEmail(value) {
    // regex from http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(value);
  },
  validateDollars: function validateDollars(value) {
    //will accept dollar amounts with two digits after the decimal or no decimal
    //will also accept a number with or without a dollar sign
    var regex = /^\$?[0-9]+(\.[0-9][0-9])?$/;
    return regex.test(value);
  },
  commonValidate: function commonValidate() {
    //you could do something here that does general validation for any form field
    return true;
  },
  setContributor: function setContributor(event) {
    //If the contributor input field were directly within this
    //this component, we could use this.refs.contributor.value
    //Instead, we want to save the data for when the form is submitted
    this.setState({
      contributor: event.target.value
    });
  },
  render: function render() {
    return React.createElement(
      'form',
      { className: 'donationForm', onSubmit: this.handleSubmit },
      React.createElement(
        'h2',
        null,
        'University Donation'
      ),
      React.createElement(TextInput, {
        uniqueName: 'email',
        text: 'Email Address',
        required: true,
        minCharacters: 6,
        validate: this.validateEmail,
        onChange: this.handleEmailInput,
        errorMessage: 'Email is invalid',
        emptyMessage: 'Email is required' }),
      React.createElement('br', null),
      React.createElement('br', null),
      React.createElement(TextInput, {
        ref: 'contributor',
        text: 'Your Name',
        uniqueName: 'contributor',
        required: true,
        minCharacters: 3,
        validate: this.commonValidate,
        onChange: this.setContributor,
        errorMessage: 'Name is invalid',
        emptyMessage: 'Name is required' }),
      React.createElement('br', null),
      React.createElement('br', null),
      React.createElement(
        'h4',
        null,
        'Where would you like your donation to go?'
      ),
      React.createElement(Department, null),
      React.createElement('br', null),
      React.createElement('br', null),
      React.createElement(
        'h4',
        null,
        'How much would you like to give?'
      ),
      React.createElement(Radios, {
        values: [10, 25, 50],
        name: 'amount',
        addAny: true,
        anyLabel: ' Donate a custom amount',
        anyPlaceholder: 'Amount (0.00)',
        anyValidation: this.validateDollars,
        anyErrorMessage: 'Amount is not a valid dollar amount',
        itemLabel: ' Donate $[VALUE]' }),
      React.createElement('br', null),
      React.createElement('br', null),
      React.createElement(
        'h4',
        null,
        'Payment Information'
      ),
      React.createElement(Payment, null),
      React.createElement('br', null),
      React.createElement('input', { type: 'submit', value: 'Submit' })
    );
  }
});

var InputError = React.createClass({
  displayName: 'InputError',

  getInitialState: function getInitialState() {
    return {
      message: 'Input is invalid'
    };
  },
  render: function render() {
    var errorClass = classNames(this.props.className, {
      'error_container': true,
      'visible': this.props.visible,
      'invisible': !this.props.visible
    });

    return React.createElement(
      'div',
      { className: errorClass },
      React.createElement(
        'span',
        null,
        this.props.errorMessage
      )
    );
  }

});

var TextInput = React.createClass({
  displayName: 'TextInput',

  getInitialState: function getInitialState() {
    //most of these variables have to do with handling errors
    return {
      isEmpty: true,
      value: null,
      valid: false,
      errorMessage: "Input is invalid",
      errorVisible: false
    };
  },

  handleChange: function handleChange(event) {
    //validate the field locally
    this.validation(event.target.value);

    //Call onChange method on the parent component for updating it's state
    //If saving this field for final form submission, it gets passed
    // up to the top component for sending to the server
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  },

  validation: function validation(value, valid) {
    //The valid variable is optional, and true if not passed in:
    if (typeof valid === 'undefined') {
      valid = true;
    }

    var message = "";
    var errorVisible = false;

    //we know how to validate text fields based on information passed through props
    if (!valid) {
      //This happens when the user leaves the field, but it is not valid
      //(we do final validation in the parent component, then pass the result
      //here for display)
      message = this.props.errorMessage;
      valid = false;
      errorVisible = true;
    } else if (this.props.required && jQuery.isEmptyObject(value)) {
      //this happens when we have a required field with no text entered
      //in this case, we want the "emptyMessage" error message
      message = this.props.emptyMessage;
      valid = false;
      errorVisible = true;
    } else if (value.length < this.props.minCharacters) {
      //This happens when the text entered is not the required length,
      //in which case we show the regular error message
      message = this.props.errorMessage;
      valid = false;
      errorVisible = true;
    }

    //setting the state will update the display,
    //causing the error message to display if there is one.
    this.setState({
      value: value,
      isEmpty: jQuery.isEmptyObject(value),
      valid: valid,
      errorMessage: message,
      errorVisible: errorVisible
    });
  },

  handleBlur: function handleBlur(event) {
    //Complete final validation from parent element when complete
    var valid = this.props.validate(event.target.value);
    //pass the result to the local validation element for displaying the error
    this.validation(event.target.value, valid);
  },
  render: function render() {

    return React.createElement(
      'div',
      { className: this.props.uniqueName },
      React.createElement('input', {
        placeholder: this.props.text,
        className: 'input input-' + this.props.uniqueName,
        onChange: this.handleChange,
        onBlur: this.handleBlur,
        value: this.state.value }),
      React.createElement(InputError, {
        visible: this.state.errorVisible,
        errorMessage: this.state.errorMessage })
    );
  }
});

var Radios = React.createClass({
  displayName: 'Radios',

  getInitialState: function getInitialState() {
    //displayClass is the class we use for displaying or hiding
    //the optional "any value" text field
    return {
      displayClass: 'invisible',
      valid: false,
      errorMessage: "Input is invalid",
      errorVisible: false
    };
  },
  handleClick: function handleClick(displayClass, e) {
    //if we click any option other than the "any value" option,
    //we hide the "any value" text field. Otherwise, show it
    if (displayClass == 'invisible') {
      this.setState({
        displayClass: displayClass,
        errorVisible: false
      });
    } else {
      this.setState({ displayClass: displayClass });
    }
  },
  handleAnyChange: function handleAnyChange(e) {
    //this validation is specifically for the optional "any value" text field
    //Since we have no idea what the requirements are locally, we call the parent
    //validation function, then set the error states accordingly
    if (this.props.anyValidation(e.target.value)) {
      this.setState({
        valid: true,
        errorMessage: "Input is invalid",
        errorVisible: false
      });
    } else {
      this.setState({
        valid: false,
        errorMessage: this.props.anyErrorMessage,
        errorVisible: true
      });
    }
  },
  render: function render() {
    var rows = [];
    var label = "";

    //we have passed in all the options for the radios, so we traverse the array
    for (var i = 0; i < this.props.values.length; i++) {
      //We do this little replace for when we want to display the value as part of
      //additional text. Otherwise, we would just put '[VALUE]' when passing
      //the itemLabel prop from the parent component, or leave out '[VALUE]' entirely
      label = this.props.itemLabel.replace('[VALUE]', this.props.values[i]);

      //You'll see that even the <br /> field has a key. React will give you errors
      //if you don't do this. This is just an axample of what's possible, but
      //you would normally add extra spacing with css
      rows.push(React.createElement('input', {
        key: this.props.name + '-' + i,
        type: 'radio',
        ref: this.props.name + '-' + this.props.values[i],
        name: this.props.name,
        value: this.props.values[i],
        onClick: this.handleClick.bind(this, 'invisible') }), React.createElement(
        'label',
        { key: this.props.name + '-label-' + i, htmlFor: this.props.values[i] },
        label
      ), React.createElement('br', { key: this.props.name + '-br-' + i }));
    }

    //The "any value" field complicates things a bit
    if (this.props.addAny) {
      //we passed in a separate label just for the option that
      //activates the "any value" text field
      label = this.props.anyLabel;
      rows.push(React.createElement('input', {
        key: this.props.name + '-' + i,
        type: 'radio',
        ref: this.props.name + '-any',
        name: this.props.name, value: 'any',
        onClick: this.handleClick.bind(this, 'visible') }), React.createElement(
        'label',
        { key: this.props.name + '-label-' + i, htmlFor: this.props.values[i] },
        label
      ));

      //and now we add the "any value text field, with all its special variables"
      rows.push(React.createElement(
        'div',
        { key: this.props.name + '-div-' + (i + 2), className: this.state.displayClass },
        React.createElement('input', {
          className: 'anyValue',
          key: this.props.name + '-' + (i + 1),
          type: 'text',
          placeholder: this.props.anyPlaceholder,
          onChange: this.handleAnyChange,
          ref: this.props.name })
      ));
    }

    //Now we just return all those rows, along with the error component
    return React.createElement(
      'div',
      { className: 'radios' },
      rows,
      React.createElement(InputError, {
        visible: this.state.errorVisible,
        errorMessage: this.state.errorMessage })
    );
  }
});

var Payment = React.createClass({
  displayName: 'Payment',

  //we have no error checking for this one, so there are no error states
  getInitialState: function getInitialState() {
    return {
      displayClass: 'invisible'
    };
  },
  handleClick: function handleClick(displayClass, e) {
    //we simply set the state in order to update the display when
    //we want to show the extra options
    this.setState({ displayClass: displayClass });
  },
  render: function render() {
    //we take full control over the checkbox that allows us to show additional options
    //this will ensure that we truly toggle the options, and don't wind up with a case
    //where the checkbox is not checked but the extra options show and vice versa
    var optionsClass = "invisible";
    var isChecked = false;
    if (this.state.displayClass == 'invisible') {
      optionsClass = "visible";
    } else {
      isChecked = true;
    }

    //We could have extra checkboxes, but this is just to show how to properly show other options
    //when a checkbox is checked. We won't do error checking on the payment info here.
    return React.createElement(
      'div',
      { className: 'payment' },
      React.createElement(
        'a',
        { href: '#' },
        'PayPal button goes here'
      ),
      React.createElement('br', null),
      React.createElement('input', { type: 'checkbox', checked: isChecked, onChange: this.handleClick.bind(this, optionsClass), name: 'card' }),
      'Pay with card',
      React.createElement('br', null),
      React.createElement(
        'div',
        { id: 'Choices', className: this.state.displayClass },
        'Credit Card Information',
        React.createElement('br', null),
        React.createElement('input', { type: 'text', placeholder: 'Card number', ref: 'card' }),
        'Card number',
        React.createElement('br', null),
        React.createElement('input', { type: 'text', placeholder: 'CVV', ref: 'cvv' }),
        'CVV',
        React.createElement('br', null),
        React.createElement('input', { type: 'text', placeholder: 'etc', ref: 'whatever' }),
        'Etc',
        React.createElement('br', null)
      ),
      React.createElement(InputError, {
        visible: this.state.errorVisible,
        errorMessage: this.state.errorMessage })
    );
  }
});

var Department = React.createClass({
  displayName: 'Department',

  getInitialState: function getInitialState() {
    return {
      displayClass: 'invisible'
    };
  },
  handleClick: function handleClick(e) {
    //We're doing another one of these "any value" fields, only shown when
    //a specific "other" option is chosen
    var displayClass = 'invisible';
    if (e.target.value == 'other') {
      displayClass = 'visible';
    }
    this.setState({ displayClass: displayClass });
  },
  render: function render() {
    //This is a select field with options and sub-options, plus an "any value" field
    return React.createElement(
      'div',
      { className: 'department' },
      React.createElement(
        'select',
        { onChange: this.handleClick, multiple: false, ref: 'department' },
        React.createElement('option', { value: 'none' }),
        React.createElement(
          'optgroup',
          { label: 'College' },
          React.createElement(
            'option',
            { value: 'muir' },
            'Muir'
          ),
          React.createElement(
            'option',
            { value: 'revelle' },
            'Revelle'
          ),
          React.createElement(
            'option',
            { value: 'sixth' },
            'Sixth'
          )
        ),
        React.createElement(
          'optgroup',
          { label: 'School' },
          React.createElement(
            'option',
            { value: 'jacobs' },
            'Jacobs School of Engineering'
          ),
          React.createElement(
            'option',
            { value: 'global' },
            'School of Global Policy and Strategy'
          ),
          React.createElement(
            'option',
            { value: 'medicine' },
            'School of Medicine'
          )
        ),
        React.createElement(
          'option',
          { value: 'scholarships' },
          'Scholarships'
        ),
        React.createElement(
          'option',
          { value: 'other' },
          'Other'
        )
      ),
      React.createElement(
        'div',
        { className: this.state.displayClass },
        React.createElement('input', { className: 'anyValue', type: 'text', placeholder: 'Department', ref: 'any-department' })
      ),
      React.createElement(InputError, {
        visible: this.state.errorVisible,
        errorMessage: this.state.errorMessage })
    );
  }
});

ReactDOM.render(React.createElement(DonationBox, { url: 'donations.json', pollInterval: 2000 }), document.getElementById('content'));