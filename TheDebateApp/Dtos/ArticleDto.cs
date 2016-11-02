namespace TheDebateApp.Dtos
{
    public class ArticleDto
    {
        public ArticleDto(TheDebateApp.Models.Article entity)
        {
            this.Id = entity.Id;
            this.Title = entity.Title;
        }

        public ArticleDto()
        {
            
        }

        public int Id { get; set; }
        public string Title { get; set; }
    }
}
