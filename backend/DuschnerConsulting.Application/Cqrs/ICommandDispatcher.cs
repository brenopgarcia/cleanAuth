namespace DuschnerConsulting.Application.Cqrs;

public interface ICommandDispatcher
{
    Task<TResult> Send<TCommand, TResult>(TCommand command, CancellationToken cancellationToken)
        where TCommand : ICommand<TResult>;
}

