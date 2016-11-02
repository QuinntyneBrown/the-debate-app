using System;
using System.Collections.Generic;
using TheDebateApp.Data;
using TheDebateApp.Dtos;
using System.Data.Entity;
using System.Linq;
using TheDebateApp.Models;

namespace TheDebateApp.Services
{
    public class RoleService : IRoleService
    {
        public RoleService(IUow uow, ICacheProvider cacheProvider)
        {
            _uow = uow;
            _repository = uow.Roles;
            _cache = cacheProvider.GetCache();
        }

        public RoleAddOrUpdateResponseDto AddOrUpdate(RoleAddOrUpdateRequestDto request)
        {
            var entity = _repository.GetAll()
                .FirstOrDefault(x => x.Id == request.Id && x.IsDeleted == false);
            if (entity == null) _repository.Add(entity = new Role());
            entity.Name = request.Name;
            _uow.SaveChanges();
            return new RoleAddOrUpdateResponseDto(entity);
        }

        public dynamic Remove(int id)
        {
            var entity = _repository.GetById(id);
            entity.IsDeleted = true;
            _uow.SaveChanges();
            return id;
        }

        public ICollection<RoleDto> Get()
        {
            ICollection<RoleDto> response = new HashSet<RoleDto>();
            var entities = _repository.GetAll().Where(x => x.IsDeleted == false).ToList();
            foreach(var entity in entities) { response.Add(new RoleDto(entity)); }    
            return response;
        }


        public RoleDto GetById(int id)
        {
            return new RoleDto(_repository.GetAll().Where(x => x.Id == id && x.IsDeleted == false).FirstOrDefault());
        }

        protected readonly IUow _uow;
        protected readonly IRepository<Role> _repository;
        protected readonly ICache _cache;
    }
}
