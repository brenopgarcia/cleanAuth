using FluentValidation.Results;

namespace DuschnerConsulting.Api.Validation;

public static class FluentValidationExtensions
{
    public static IDictionary<string, string[]> ToDictionary(this ValidationResult result)
    {
        return result.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(
                g => g.Key,
                g => g.Select(e => e.ErrorMessage).Distinct().ToArray());
    }
}

