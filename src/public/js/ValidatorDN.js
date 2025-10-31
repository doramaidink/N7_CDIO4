function Validator(options){
    function setError(inputElement, message){
        var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
        if (errorElement) errorElement.innerText = message || '';
        inputElement.parentElement.classList.toggle('invalid', !!message);
        inputElement.classList.toggle('todo', !!message);
    }

    function validate(inputElement, rule){
        var errorMessage = rule.test(inputElement.value);
        if (errorMessage){
            setError(inputElement, errorMessage);
            return false;
        } else {
            setError(inputElement, '');
            return true;
        }
    }

    var formElement = document.querySelector(options.form);
    if (!formElement) return;

    // Validate + submit
    formElement.addEventListener('submit', function(e){
        var isFormValid = true;

        options.rules.forEach(function(rule){
            var inputElement = formElement.querySelector(rule.selector);
            if (inputElement && !validate(inputElement, rule)){
                isFormValid = false;
            }
        });

        if (!isFormValid){
            // ❌ Sai thì chặn submit
            e.preventDefault();
        } else {
            // ✅ Đúng thì để hành vi mặc định diễn ra
            // (không e.preventDefault), và dọn sạch trạng thái lỗi
            var allInputs = formElement.querySelectorAll('input');
            allInputs.forEach(function(input){
                setError(input, '');
            });
            // KHÔNG gọi form.submit() để giữ đúng "hành vi mặc định"
        }
    });

    // Blur / Input
    options.rules.forEach(function(rule){
        var inputElement = formElement.querySelector(rule.selector);
        if (inputElement){
            inputElement.addEventListener('blur', function(){
                validate(inputElement, rule);
            });
            inputElement.addEventListener('input', function(){
                setError(inputElement, '');
            });
        }
    });
}




Validator.isUserDN = function(selector){
    return {
        selector,
        test: function(value){
            return value.trim() ? undefined : 'Tên đăng nhập hoặc mật khẩu không tồn tại';
        }
    }
}
