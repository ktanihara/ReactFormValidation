var DonationBox = React.createClass({
  handleDonationSubmit: function(donation) {
    //this is just an example of how you would submit a form
    //you would have to implement something separately on the server
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: donation,
      success: function(data) {
        //this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    //this is not currently used, but you could display donations in real time
    //by updating the state of the donation data when the form is submitted,
    //then poll the server for new donations.
    return {data: []};
  },
  render: function() {
    return (
      <div className="donationBox">
        {/* perhaps list new donations here or below the submit box */}
        <DonationForm onDonationSubmit={this.handleDonationSubmit} />
      </div>
    );
  }
});

var DonationForm = React.createClass({
  getInitialState: function() {
    //we are only saving the contributor as an example
    //of how to save data changes for final submission
    return {
      contributor: ""
    };
  },
  handleSubmit: function(e) {
    //we don't want the form to submit, so we prevent the defaul behavior
    e.preventDefault();
    var contributor = this.state.contributor.trim();
    if (!contributor) {
      return;
    }

    //Here we do the final submit to the parent component
    this.props.onDonationSubmit({contributor: contributor});
  },
  validateEmail: function (value) {
    // regex from http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(value);
  },
  validateDollars: function (value) {
    //will accept dollar amounts with two digits after the decimal or no decimal
    //will also accept a number with or without a dollar sign
    var regex  = /^\$?[0-9]+(\.[0-9][0-9])?$/;
    return regex.test(value);
  },
  commonValidate: function () {
    //you could do something here that does general validation for any form field
    return true;
  },
  setContributor: function (event) {
    //If the contributor input field were directly within this
    //this component, we could use this.refs.contributor.value
    //Instead, we want to save the data for when the form is submitted
    this.setState({
      contributor: event.target.value
    });
  },
  render: function() {
    //Each form field is actually another component.
    //Two of the form fields use the same component, but with different variables
    return (
      <form className="donationForm" onSubmit={this.handleSubmit}>
        <h2>University Donation</h2>

        <TextInput
          uniqueName="email"
          text="Email Address"
          required={true}
          minCharacters={6}
          validate={this.validateEmail}
          onChange={this.handleEmailInput}
          errorMessage="Email is invalid"
          emptyMessage="Email is required" />
        <br /><br />

        <TextInput
          ref="contributor"
          text="Your Name"
          uniqueName="contributor"
          required={true}
          minCharacters={3}
          validate={this.commonValidate}
          onChange={this.setContributor}
          errorMessage="Name is invalid"
          emptyMessage="Name is required" />
        <br /><br />

        {/* This Department component is specialized to include two fields in one */}
        <h4>Where would you like your donation to go?</h4>
        <Department />
        <br /><br />

        {/* This Radios component is specialized to include two fields in one */}
        <h4>How much would you like to give?</h4>
        <Radios
          values={[10, 25, 50]}
          name="amount"
          addAny={true}
          anyLabel=" Donate a custom amount"
          anyPlaceholder="Amount (0.00)"
          anyValidation={this.validateDollars}
          anyErrorMessage="Amount is not a valid dollar amount"
          itemLabel={' Donate $[VALUE]'} />
        <br /><br />

        <h4>Payment Information</h4>
        <Payment />
        <br />

        <input type="submit" value="Submit" />
      </form>
    );
  }
});

var InputError = React.createClass({
  getInitialState: function() {
    return {
      message: 'Input is invalid'
    };
  },
  render: function(){
    var errorClass = classNames(this.props.className, {
      'error_container':   true,
      'visible':           this.props.visible,
      'invisible':         !this.props.visible
    });

    return (
      <div className={errorClass}>
        <span>{this.props.errorMessage}</span>
      </div>
    )
  }

});

var TextInput = React.createClass({
  getInitialState: function(){
    //most of these variables have to do with handling errors
    return {
      isEmpty: true,
      value: null,
      valid: false,
      errorMessage: "Input is invalid",
      errorVisible: false
    };
  },

  handleChange: function(event){
    //validate the field locally
    this.validation(event.target.value);

    //Call onChange method on the parent component for updating it's state
    //If saving this field for final form submission, it gets passed
    // up to the top component for sending to the server
    if(this.props.onChange) {
      this.props.onChange(event);
    }
  },

  validation: function (value, valid) {
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
    }
    else if (this.props.required && jQuery.isEmptyObject(value)) {
      //this happens when we have a required field with no text entered
      //in this case, we want the "emptyMessage" error message
      message = this.props.emptyMessage;
      valid = false;
      errorVisible = true;
    }
    else if (value.length < this.props.minCharacters) {
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

  handleBlur: function (event) {
    //Complete final validation from parent element when complete
    var valid = this.props.validate(event.target.value);
    //pass the result to the local validation element for displaying the error
    this.validation(event.target.value, valid);
  },
  render: function() {

    return (
      <div className={this.props.uniqueName}>
        <input
          placeholder={this.props.text}
          className={'input input-' + this.props.uniqueName}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          value={this.state.value} />

        <InputError
          visible={this.state.errorVisible}
          errorMessage={this.state.errorMessage} />
      </div>
    );
  }
});

var Radios = React.createClass({
  getInitialState: function() {
    //displayClass is the class we use for displaying or hiding
    //the optional "any value" text field
    return {
      displayClass: 'invisible',
      valid: false,
      errorMessage: "Input is invalid",
      errorVisible: false
    };
  },
  handleClick: function(displayClass, e) {
    //if we click any option other than the "any value" option,
    //we hide the "any value" text field. Otherwise, show it
    if (displayClass == 'invisible') {
      this.setState(
        {
          displayClass: displayClass,
          errorVisible: false
        }
      );
    }
    else {
      this.setState({displayClass: displayClass});
    }
  },
  handleAnyChange: function(e) {
    //this validation is specifically for the optional "any value" text field
    //Since we have no idea what the requirements are locally, we call the parent
    //validation function, then set the error states accordingly
    if (this.props.anyValidation(e.target.value)) {
      this.setState(
        {
          valid: true,
          errorMessage: "Input is invalid",
          errorVisible: false
        }
      );
    }
    else {
      this.setState(
        {
          valid: false,
          errorMessage: this.props.anyErrorMessage,
          errorVisible: true
        }
      );
    }
  },
  render: function() {
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
      rows.push(<input
        key={this.props.name + '-' + i}
        type="radio"
        ref={this.props.name + '-' + this.props.values[i]}
        name={this.props.name}
        value={this.props.values[i]}
        onClick={this.handleClick.bind(this, 'invisible')} />,

        <label key={this.props.name + '-label-' + i} htmlFor={this.props.values[i]}>{label}</label>,

        <br key={this.props.name + '-br-' + i} />);
    }

    //The "any value" field complicates things a bit
    if (this.props.addAny) {
      //we passed in a separate label just for the option that
      //activates the "any value" text field
      label = this.props.anyLabel;
      rows.push(<input
        key={this.props.name + '-' + i}
        type="radio"
        ref={this.props.name + '-any'}
        name={this.props.name} value="any"
        onClick={this.handleClick.bind(this, 'visible')} />,

        <label key={this.props.name + '-label-' + i} htmlFor={this.props.values[i]}>{label}</label>);

      //and now we add the "any value text field, with all its special variables"
      rows.push(<div key={this.props.name + '-div-' + (i+2)} className={this.state.displayClass}>
        <input
          className="anyValue"
          key={this.props.name + '-' + (i+1)}
          type="text"
          placeholder={this.props.anyPlaceholder}
          onChange={this.handleAnyChange}
          ref={this.props.name} />
      </div>);
    }

    //Now we just return all those rows, along with the error component
    return (
      <div className="radios">
        {rows}

        <InputError
          visible={this.state.errorVisible}
          errorMessage={this.state.errorMessage} />
      </div>
    );
  }
});

var Payment = React.createClass({
  //we have no error checking for this one, so there are no error states
  getInitialState: function() {
    return {
      displayClass: 'invisible'
    };
  },
  handleClick: function(displayClass, e) {
    //we simply set the state in order to update the display when
    //we want to show the extra options
    this.setState({displayClass: displayClass});
  },
  render: function() {
    //we take full control over the checkbox that allows us to show additional options
    //this will ensure that we truly toggle the options, and don't wind up with a case
    //where the checkbox is not checked but the extra options show and vice versa
    var optionsClass = "invisible";
    var isChecked = false;
    if (this.state.displayClass == 'invisible') {
      optionsClass = "visible";
    }
    else {
      isChecked = true;
    }

    //We could have extra checkboxes, but this is just to show how to properly show other options
    //when a checkbox is checked. We won't do error checking on the payment info here.
    return (
      <div className="payment">
        <a href="#">PayPal button goes here</a>
        <br />
        <input type="checkbox" checked={isChecked} onChange={this.handleClick.bind(this, optionsClass)} name="card" />Pay with card<br />
        <div id="Choices" className={this.state.displayClass}>Credit Card Information<br />
          <input type="text" placeholder="Card number" ref="card" />Card number<br />
          <input type="text" placeholder="CVV" ref="cvv" />CVV<br />
          <input type="text" placeholder="etc" ref="whatever" />Etc<br />
        </div>
        <InputError
          visible={this.state.errorVisible}
          errorMessage={this.state.errorMessage} />
      </div>
    );
  }
});

var Department = React.createClass({
  getInitialState: function() {
    return {
      displayClass: 'invisible'
    };
  },
  handleClick: function(e) {
    //We're doing another one of these "any value" fields, only shown when
    //a specific "other" option is chosen
    var displayClass = 'invisible';
    if (e.target.value == 'other') {
      displayClass = 'visible';
    }
    this.setState({displayClass: displayClass});
  },
  render: function() {
    //This is a select field with options and sub-options, plus an "any value" field
    return (
      <div className="department">
        <select onChange={this.handleClick} multiple={false} ref="department">
          <option value="none"></option>
          <optgroup label="College">
            <option value="muir">Muir</option>
            <option value="revelle">Revelle</option>
            <option value="sixth">Sixth</option>
          </optgroup>
          <optgroup label="School">
            <option value="jacobs">Jacobs School of Engineering</option>
            <option value="global">School of Global Policy and Strategy</option>
            <option value="medicine">School of Medicine</option>
          </optgroup>
          <option value="scholarships">Scholarships</option>
          <option value="other">Other</option>
        </select>
        <div className={this.state.displayClass}>
          <input className="anyValue" type="text" placeholder="Department" ref="any-department" />
        </div>

        <InputError
          visible={this.state.errorVisible}
          errorMessage={this.state.errorMessage} />
      </div>
    );
  }
});


ReactDOM.render(
  <DonationBox url="donations.json" pollInterval={2000} />,
  document.getElementById('content')
);
