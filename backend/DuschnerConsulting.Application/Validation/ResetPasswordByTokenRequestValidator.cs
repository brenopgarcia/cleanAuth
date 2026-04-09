using DuschnerConsulting.Application.Contracts;
using FluentValidation;

namespace DuschnerConsulting.Application.Validation;

public sealed class ResetPasswordByTokenRequestValidator : AbstractValidator<ResetPasswordByTokenRequest>
{
    public ResetPasswordByTokenRequestValidator()
    {
        RuleFor(x => x.Token)
            .NotEmpty()
            .MinimumLength(32);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .MaximumLength(256);
    }
}

