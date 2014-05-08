//WARNING : must include sprintf before (http://hexmen.com/js/sprintf.js)
function print_r(theObj) {    
    var win_print_r = '';   
    for(var p in theObj){  
        var _type = typeof(theObj[p]);  
        if( (_type.indexOf('array') >= 0) || (_type.indexOf('object') >= 0) ){  
            win_print_r += '<li class="JSDebugContainer">';  
            win_print_r += '['+_type+'] => '+p;  
            win_print_r += '<ul class="JSDebugList">';  
            win_print_r += print_r(theObj[p]);  
            win_print_r += '</ul></li>';  
        } else {  
            win_print_r += '<li class="JSDebugItem">['+p+'] => '+theObj[p]+'</li>';  
        }  
    }  
    return win_print_r;  
}

(function($){
    $.fn.formidable = function(elements){
        //formType : basic, login, register
        //errorClass : CSS class to add to an input if there's an error
        //validClass : CSS class to add to an input if there's no error
        //tooltip : boolean ; set to true if you wanna add tooltips
        var settings = $.extend(true, {
            actions : false,
            defaultMinChar : 0,
            defaultMaxChar : 20,
            formType : 'basic',
            emptyCheck: true,
            errorClass: 'fcError',
            validClass: 'fcValid',
            inputClass: 'fcInput',
            submitClass: 'fcSubmit',
            ajaxPath: 'js/ajax/request.php',
            tooltip: true
        }, elements);
		
        //Init Errors namespace
        Errors = {
            'count':0
        };
		
        Object.size = function(obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };
        
        function addError(rank, errorId, message){
            if(Errors[rank][errorId] == '' || Errors[rank][errorId] == undefined){
                Errors[rank][errorId] = message;
                Errors[rank]['count']++;
                Errors['count']++;
            }
        }
        
        function initInputError(rank){
            Errors[rank] = Array();
            Errors[rank]['count'] = 0;
        }
		
        function removeError(rank, errorId, message){
            if(Errors[rank][errorId] != '' && Errors[rank][errorId] != undefined){
                delete Errors[rank][errorId];
                Errors['count']--;
                Errors[rank]['count']--;
            }
        }
		
        function displayErrors(){
            var errorString = '<ul class="fcErrorList">';
            var countErrors = Errors['count'];
            for(var i = 0; i < Object.size(Errors); i++){
                if(Errors[i] != undefined){
                    for(key in Errors[i])
                        if(!isNaN(key))
                            errorString += '<li class="fcErrorItem">' + Errors[i][key] + '</li>';
                }
            }
            errorString += '</ul>';
            
            if(countErrors > 0){
                $('.fcNotificationBox').html(errorString).append(sprintf(tranCountErrors, countErrors)).show();
            }
            else
                $('.fcNotificationBox').html(errorString).show();
        }
        
        function setError(rank, input, errorId, message, defaultTooltip){
            if(Errors[rank][errorId] == '' || Errors[rank][errorId] == undefined)
                addError(rank, errorId, message);
            if(Errors[rank]['count'] >= 1){
                if(Main['tooltip'])
                    input.attr({
                        'fctool': message + defaultTooltip
                    });
                removeValidInput(rank);
                input.removeClass(settings['validClass']);
                input.addClass(settings['errorClass']);
            }  
        }
        
        function unsetError(rank, input, errorId, message){
            if(Errors[rank][errorId] != '' && Errors[rank][errorId] != undefined)
                removeError(rank, errorId, message);
            if(Errors[rank]['count'] < 1){
                if(Main['tooltip'])
                    input.attr({
                        'fctool': tranValid
                    });
                addValidInput(rank);
                input.removeClass(settings['errorClass']);
                input.addClass(settings['validClass']);
            }
        }
		
        function refreshStates(input){
            fillTooltip(input);
            checkInputs();
            displayErrors();
        }        
                
        //init inputs states
        Inputs = {};
        function addInput(input, rank, type){
            Inputs[rank] = Array();
            Inputs[rank]['defaultTooltip'] = '';
            Inputs[rank]['input'] = input;
            Inputs[rank]['type'] = type; 
        }
        
        function modifyDefaultTooltip(rank, message){
            Inputs[rank]['defaultTooltip'] += message;
        }
        
        InputsValid = {};
		
        function addValidInput(rank){
            InputsValid[rank] = 'valid';
        }
		
        function removeValidInput(rank){
            delete InputsValid[rank];
        }
		
        function checkInputs(){
            var countInputs = $('input:not([type=submit])', Main['form']).size();
            var countValidInputs = Object.size(InputsValid);
            if(countInputs === countValidInputs)
                $('input[type=submit]', Main['form']).removeAttr('disabled').show();
            else
                $('input[type=submit]', Main['form']).hide().attr({
                    'disabled':'disabled'
                });
        }
        
        function resetForm(){
            $('input:not([type=submit])', Main['form']).val('');
            for(var i = 0; i < Object.size(Inputs); i++){
                Inputs[i]['input'].removeClass(settings['validClass']);
                removeValidInput(i);
            }
            $('input[type=submit]', Main['form']).hide().attr({
                'disabled':'disabled'
            });
        }
		
        //Main methods
        Main = {
            //Checks if the field is empty or not
            emptyCheck: function(rank, input, minChar, maxChar, defaultTooltip){
                if(input.val() === ''){
                    setError(rank, input, 0, tranEmptyField, defaultTooltip);
                }
                else {
                    unsetError(rank, input, 0, tranEmptyField);
                }
                refreshStates(input);
            },
            //Checks if the input value's length is between min and max values.
            lengthCheck: function(rank, input, minChar, maxChar, defaultTooltip){
                if(input.val().length < minChar){
                    setError(rank, input, 1, tranTooShort, defaultTooltip);
                }
                if(input.val().length > maxChar){
                    setError(rank, input, 1, tranTooLong, defaultTooltip);
                }
                if(input.val().length <= maxChar && input.val().length >= minChar){
                    unsetError(rank, input, 1, tranTooShort);
                    unsetError(rank, input, 1, tranTooLong);
                }
                refreshStates(input);
            },
            //Checks if the mail address typed by an user is valid.
            mailCheck: function(rank, input, minChar, maxChar, defaultTooltip){
                //Mail address's length is always at least of 3 characters
                if(input.val().length >= 3){
                    //Checks if there are special chars in the mail field (like '@' or '..')
                    if(input.val().match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) == null){
                        setError(rank, input, 2, tranInvalidMail, defaultTooltip);
                    }
                    else {
                        unsetError(rank, input, 2, tranInvalidMail);
                        input.attr({
                            'disabled':'disabled'
                        });
                        //Requires a personnal AJAX call
                        $.ajax({
                            type: 'POST',
                            url: settings['ajaxPath'],
                            dataType: 'html',
                            data: {
                                'login':Inputs[rank]['input'].val(),
                                'action':'mailCheck'
                            },
                            error: function(object, type, message){
                                alert(message);
                            },
                            success: function(answer){
                                if(answer)
                                    setError(rank, input, 5, sprintf(tranInvalidExistingMail, Inputs[rank]['input'].val()), defaultTooltip);
                                else
                                    unsetError(rank, input, 5, tranInvalidExistingMail);
                                input.removeAttr('disabled');
                                refreshStates(input);
                            }
                        });
                    }
                }
                else{
                    setError(rank, input, 2, tranInvalidMail, defaultTooltip);
                }
                refreshStates(input);
            },
            //Checks if the password is complex enough and doesn't contain some spacial chars
            passwordCheck: function(rank, input, minChar, maxChar, defaultTooltip){
                for(var i = 0; i < Object.size(Inputs); i++){
                    if(Inputs[i]['type'] === 'passwordRepeat'){
                        if(Inputs[i]['input'].val() !== input.val()){
                            Inputs[i]['input'].val('');
                            setError(rank, input, 4, tranInvalidPasswordRepeat, defaultTooltip);
                        }
                        //If the passwordRepeat's value if different, 
                        Main.passwordRepeatCheck(i, Inputs[i]['input'], minChar, maxChar, defaultTooltip);

                        //To leave the "for", as there's only one password repeat field
                        i = Object.size(Inputs);
                    }
                }
                refreshStates(input);
            },
            //Checks if the repeated password input matches the original password input.
            passwordRepeatCheck: function(rank, input, minChar, maxChar, defaultTooltip){
                if(input.val() !== ''){
                    unsetError(rank, input, 0, tranEmptyField, defaultTooltip);
                    for(var i = 0; i < Object.size(Inputs); i++){
                        if(Inputs[i]['type'] === 'password'){
                            if(Inputs[i]['input'].val() !== input.val()){
                                //Set error to the password repeat field
                                setError(rank, input, 4, tranInvalidPasswordRepeat, defaultTooltip);
                                //Set error to the password field
                                setError(i, Inputs[i]['input'], 4, tranInvalidPasswordRepeat, defaultTooltip);
                            }
                            else{
                                //Unset error to the password repeat field
                                unsetError(rank, input, 4, tranInvalidPasswordRepeat);
                                //Unset error to the password field
                                unsetError(i, Inputs[i]['input'], 4, tranInvalidPasswordRepeat);
                            }
                            //To leave the "for", as there's only one password repeat field
                            i = Object.size(Inputs);
                        }
                    }      
                }
                else{
                    setError(rank, input, 0, tranEmptyField, defaultTooltip);
                }
                refreshStates(input);
            },
            //Checks if the pseudo is already used. Requires a personal AJAX call.
            existingPseudoCheck: function(rank, input, minChar, maxChar, defaultTooltip){
                input.attr({
                    'disabled':'disabled'
                });
                $.ajax({
                    type: 'POST',
                    url: settings['ajaxPath'],
                    dataType: 'html',
                    data: {
                        'login':Inputs[rank]['input'].val(),
                        'action':'existingPseudoCheck'
                    },
                    error: function(object, type, message){
                        alert(message);
                    },
                    success: function(answer){
                        if(answer)
                            setError(rank, input, 5, sprintf(tranInvalidPseudo, Inputs[rank]['input'].val()), defaultTooltip);
                        else
                            unsetError(rank, input, 5, tranInvalidPseudo);
                        input.removeAttr('disabled');
                        refreshStates(input);
                    }
                });
            },
            //Checks if the mail address is already used. Requires a personal AJAX call.
            existingMailCheck: function(rank, input, minChar, maxChar, defaultTooltip){
                refreshStates(input);
            }
        };
                
        function setForm(form){
            Main['form'] = form;
        }
		
        function setTooltip(tooltip){
            Main['tooltip'] = tooltip;
        }
        
        function setAjaxPath(ajaxPath){
            Main['ajaxPath'] = ajaxPath;
        }
		
        //Tools
        function insertToolsBox(form){
            form.append('<div class="fcNotificationBox" style="display:none;"></div><div class="fcTooltip" style="display:none;"></div>');
        }
		
        function displayTooltip(input){
            $('.fcTooltip').css({
                'display':'block', 
                'position':'fixed', 
                'top':input.offset().top, 
                'left':input.offset().left + input.outerWidth() + 20
            })
        }
		
        function fillTooltip(input){
            $('.fcTooltip').text(input.attr('fctool'));
        }
		
        function hideTooltip(){
            $('.fcTooltip').hide();
            $('.fcTooltip').text('');
        }
		
        //Controls MODIFS
        function initControls(){
            if($('input[type=submit]', Main['form']).length < 1)
                Main['form'].append('<input type="submit" class="' + settings['submitClass'] + '">');
            else if($('input[type=submit]', Main['form']).length > 1){
                $('input[type=submit]', Main['form']).remove();
                Main['form'].append('<input type="submit" class="' + settings['submitClass'] + '">');
            }
            $('input:not([type=submit])', Main['form']).each(function(){
                $(this).val('');
                $(this).attr({
                    'class': settings['inputClass']
                })
                if(settings[i] != undefined){
                    if(settings[i]['actions'] != undefined){
                        initInputError(i);
                        if(settings['tooltip'])
                            $(this).attr({
                                'fctool':''
                            });
                        var j = 0;
                        var defaultTooltip = '';
                        var inputType = 'basic';
                        while(settings[i]['actions'][j] !== '' && settings[i]['actions'][j] !== undefined){
                            if(settings[i]['minChar'] == undefined)
                                settings[i]['minChar'] = settings['defaultMinChar'];
                            if(settings[i]['maxChar'] == undefined)
                                settings[i]['maxChar'] = settings['defaultMaxChar'];
                            
                            switch(settings[i]['actions'][j]){
                                case 'emptyCheck':
                                    defaultTooltip = tranFillField;
                                    break;
                                case 'lengthCheck':
                                    defaultTooltip = sprintf(tranRespectLength, settings[i]['minChar'], settings[i]['maxChar']);
                                    break;
                                case 'mailCheck':
                                    defaultTooltip = tranTypeMailAddress;
                                    inputType = 'mail';
                                    break;
                                case 'passwordCheck':
                                    defaultTooltip = tranPassword;
                                    if($(this).attr('type') !== 'password')
                                        $(this).attr({
                                            'type':'password'
                                        });
                                    inputType = 'password';
                                    break;
                                case 'passwordRepeatCheck':
                                    defaultTooltip = tranRepeatPassword;
                                    if($(this).attr('type') !== 'password')
                                        $(this).attr({
                                            'type':'password'
                                        });
                                    inputType = 'passwordRepeat';
                                    break;
                                case 'existingPseudoCheck':
								
                                    break;	
                                case 'existingMailCheck':
                                    break;
                            }
                            addInput($(this), i, inputType);
                            comparing(i, $(this), settings[i]['minChar'], settings[i]['maxChar'], defaultTooltip, settings[i]['actions'][j]);
                            j++;
                        }
                    }
                }
                else {
                    $(this).attr({
                        'fctool':tranOptional
                    });
                    addInput($(this), i, 'noCheck')
                    addValidInput(i);
                }
                    
                if(settings['tooltip']){
                    $(this).hover(function(){
                        displayTooltip($(this));
                        fillTooltip($(this));
                    });
                    $(this).mouseout(function(){
                        hideTooltip();
                    });
                }
                i++;
            });
        }
        
        //Events for inputs (on click, key up, paste, cut)
        function comparing(rank, input, minChar, maxChar, defaultTooltip, action){
            if(Main['tooltip'])
                input.attr({
                    'fctool': defaultTooltip
                });
            if(input.val() !== ''){
                Main[action](rank, input, minChar, maxChar, defaultTooltip);
            }
            input.keyup(function(){
                Main[action](rank, input, minChar, maxChar, defaultTooltip);
            //modifyInputValue(input, rank);
            });
            input.on('paste', function(){
                setTimeout(function(){
                    Main[action](rank, input, minChar, maxChar, defaultTooltip);
                    
                }, 100);
            //modifyInputValue(input, rank);
            });
            input.on('cut', function(){
                setTimeout(function(){
                    Main[action](rank, input, minChar, maxChar, defaultTooltip);
                }, 100);
            //modifyInputValue(input, rank);
            });
            input.click(function(){
                setTimeout(function(){
                    Main[action](rank, input, minChar, maxChar, defaultTooltip);
                }, 100);
            //modifyInputValue(input, rank);
            });
        }
		
        //Init tools box
        insertToolsBox($(this));
		
        var i = 0;
        var countErrors = Array();
        setForm($(this));
        setTooltip(settings['tooltip']);
        initControls();

        //Init submit button -> hidding it
        $('input[type=submit]', this).attr({
            'disabled':'disabled'
        }).hide();
		
        //On form submit
        $(this).on('submit', function(){
            var submitting = true;
            //If someone tries to display the submit button and enable it and click it while there's an error, prevents form submit
            if(Errors['count'] > 0)
                submitting = false;
            //If someone tries to display the submit button and enable it and click it while all inputs are not valid, prevents form submit
            if(Object.size(Inputs) !== Object.size(InputsValid))
                submitting = false;
            if(submitting){
                var dataForm = {};
                i = 0;
                $('input:not([type=submit])', Main['form']).each(function(){
                    dataForm[i] = {};
                    dataForm[i]['value'] = $(this).val();
                    dataForm[i]['actions'] = {};
                    if(settings[i] != undefined){
                        for(j = 0; j < Object.size(settings[i]['actions']); j++){
                            dataForm[i][j] = settings[i]['actions'][j];
                        }
                        if(settings[i]['minChar'] != undefined)
                            dataForm[i]['minChar'] = settings[i]['minChar'];
                        if(settings[i]['maxChar'] != undefined)
                            dataForm[i]['maxChar'] = settings[i]['maxChar'];
                    }
                    i++;
                }).promise().done(function(){
                    //AJAX STUFF
                    $.ajax({
                        type: 'POST',
                        url: settings['ajaxPath'],
                        dataType: 'html',
                        data: {
                            'action':'submitted',
                            'dataForm':dataForm
                        },
                        error: function(object, type, message){
                            alert(message);
                        },
                        success: function(answer){
                            if(answer)
                                resetForm();
                            else
                                alert('ERROR')
                            return false;
                        }
                    });
                });
            }
            return false;
        });
    };
}(jQuery));