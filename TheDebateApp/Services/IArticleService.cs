using TheDebateApp.Dtos;
using System.Collections.Generic;

namespace TheDebateApp.Services
{
    public interface IArticleService
    {
        ArticleAddOrUpdateResponseDto AddOrUpdate(ArticleAddOrUpdateRequestDto request);
        ICollection<ArticleDto> Get();
        ArticleDto GetById(int id);
        dynamic Remove(int id);
    }
}
