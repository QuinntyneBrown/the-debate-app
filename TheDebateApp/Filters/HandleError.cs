using System.Web.Http.Filters;
using TheDebateApp.Utilities;

namespace TheDebateApp.Filters
{
    public class HandleErrorAttribute : ExceptionFilterAttribute
    {
        public HandleErrorAttribute(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger("Error");
        }

        public override void OnException(HttpActionExecutedContext context)
        {

        }

        protected readonly ILogger _logger;
    }
}


