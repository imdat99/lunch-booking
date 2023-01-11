import React, { FormEvent, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'

interface SearchProps {
  onSubmit: (query: string) => void
}

const Search = (props: SearchProps) => {
  const [query, setQuery] = useState('')

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    props.onSubmit(query)
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <div>
        <input
          type="text"
          className="rounded-full max-w-xs px-6 py-2.5 min-w-[270px] md:min-w-[400px]"
          placeholder="Search"
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="ml-2">
          <SearchIcon fontSize={'large'} />
        </button>
      </div>
    </form>
  )
}

export default Search
