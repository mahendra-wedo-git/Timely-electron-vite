import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from 'react'

export const MentionList = forwardRef((props: any, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectItem = (index: number) => {
        const item = props.items[index]
        if (item) {
            // Pass the data in the format expected by the command
            props.command({ 
                id: item.id,  // This is the user's actual ID (entity_identifier)
                label: item.display_name || item.first_name 
            })
        }
    }

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
    }

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length)
    }

    const enterHandler = () => {
        selectItem(selectedIndex)
    }

    useEffect(() => setSelectedIndex(0), [props.items])

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                upHandler()
                return true
            }
            if (event.key === 'ArrowDown') {
                downHandler()
                return true
            }
            if (event.key === 'Enter') {
                enterHandler()
                return true
            }
            return false
        },
    }))

    return (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[200px] z-50">
            {props.items.length ? (
                props.items.map((item: any, index: number) => (
                    <button
                        className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                            index === selectedIndex 
                                ? 'bg-indigo-50 text-indigo-700' 
                                : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        key={index}
                        onClick={() => selectItem(index)}
                    >
                        {item.avatar_url ? (
                            <img src={item.avatar_url} className="w-6 h-6 rounded-full object-cover" alt="" />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600">
                                {(item.display_name || item.first_name || "?")[0].toUpperCase()}
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="font-medium truncate">{item.display_name || item.first_name || "Unknown"}</span>
                        </div>
                    </button>
                ))
            ) : (
                <div className="px-4 py-2 text-sm text-gray-400">No result</div>
            )}
        </div>
    )
})

MentionList.displayName = 'MentionList'