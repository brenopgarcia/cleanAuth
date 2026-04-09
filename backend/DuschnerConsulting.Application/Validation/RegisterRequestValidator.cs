using DuschnerConsulting.Application.DTOs;
using FluentValidation;

namespace DuschnerConsulting.Application.Validation;

public sealed class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(6);

        RuleFor(x => x.UserName)
            .MaximumLength(128);
    }
}

