using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TheDebateApp.Services
{
    public interface ICacheProvider
    {
        ICache GetCache();
    }
}
