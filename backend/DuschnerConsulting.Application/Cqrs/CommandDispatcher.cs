using Microsoft.Extensions.DependencyInjection;

namespace DuschnerConsulting.Application.Cqrs;

public sealed class CommandDispatcher : ICommandDispatcher
{
    private readonly IServiceProvider _serviceProvider;

    public CommandDispatcher(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public Task<TResult> Send<TCommand, TResult>(TCommand command, CancellationToken cancellationToken)
        where TCommand : ICommand<TResult>
    {
        var handler = _serviceProvider.GetRequiredService<ICommandHandler<TCommand, TResult>>();
        return handler.Handle(command, cancellationToken);
    }
}

