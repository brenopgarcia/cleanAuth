using DuschnerConsulting.Application.Contracts;
using FluentValidation;

namespace DuschnerConsulting.Application.Validation;

public sealed class CreateTenantUserRequestValidator : AbstractValidator<CreateTenantUserRequest>
{
    public CreateTenantUserRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);

        RuleFor(x => x.UserName)
            .NotEmpty()
            .MaximumLength(128);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8);
    }
}

