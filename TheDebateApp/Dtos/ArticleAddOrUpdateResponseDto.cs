namespace TheDebateApp.Dtos
{
    public class ArticleAddOrUpdateResponseDto: ArticleDto
    {
        public ArticleAddOrUpdateResponseDto(TheDebateApp.Models.Article entity)
            :base(entity)
        {

        }
    }
}
