using DuschnerConsulting.Application.Contracts;
using FluentValidation;

namespace DuschnerConsulting.Application.Validation;

public sealed class CreateTenantRequestValidator : AbstractValidator<CreateTenantRequest>
{
    public CreateTenantRequestValidator()
    {
        RuleFor(x => x.Slug)
            .NotEmpty()
            .Matches("^[a-z0-9-]{1,63}$")
            .WithMessage("Invalid slug. Use lowercase letters, digits and '-' (max 63).");

        RuleFor(x => x.DisplayName)
            .NotEmpty()
            .MaximumLength(128);

        RuleFor(x => x.ExpiresAt)
            .Must(x => x > DateTimeOffset.UtcNow)
            .WithMessage("Expiration date must be in the future.");
    }
}

