using DuschnerConsulting.Application.Contracts;
using FluentValidation;

namespace DuschnerConsulting.Application.Validation;

public sealed class AdminLoginRequestValidator : AbstractValidator<AdminLoginRequest>
{
    public AdminLoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8);
    }
}

