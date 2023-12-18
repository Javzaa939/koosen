import React from 'react'

export default function Header({ headers }) {
    return (
        <thead>
            <tr>
                <th style={{width: '80px'}}>№</th>
                {
                    headers.map((header) =>
                        <th key={header.key} className={header.center && header.center ? 'text-center' : 'text-left'} >
                            {header.name}
                            {header?.editable ? <span style={{ fontSize: '8px', marginLeft: '3px' }}>(Enter дарж хадгална уу)</span> : ''}
                        </th>
                    )
                }
            </tr>
        </thead>
    )
}
